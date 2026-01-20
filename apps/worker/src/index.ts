// apps/worker/src/main.ts
import "dotenv/config";
import { prisma } from "@larry/db";
import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  Message,
} from "@aws-sdk/client-sqs";
import { ingestJob } from "./ingestJob.js";
import { publishDocumentStatus } from "./lib/redisProgress.js";
import {
  SQS_MAX_MESSAGES,
  SQS_WAIT_TIME_SECONDS,
  SQS_VISIBILITY_TIMEOUT_SECONDS,
  SQS_DEFAULT_REGION,
  MAX_ERROR_MESSAGE_LENGTH,
} from "./config/constants.js";
import { ENV } from "./config/env.js";

type IngestMessageBody = {
  documentId: string;
  attemptId: string;
};

const sqs = new SQSClient({
  region: ENV.SQS_REGION ?? SQS_DEFAULT_REGION,
  endpoint: ENV.SQS_ENDPOINT,
  credentials: {
    accessKeyId: ENV.SQS_ACCESS_KEY_ID,
    secretAccessKey: ENV.SQS_SECRET_ACCESS_KEY,
  },
});

function parseBody(raw: string | undefined): IngestMessageBody {
  if (!raw) throw new Error("SQS message has empty Body");
  let obj: unknown;
  try {
    obj = JSON.parse(raw);
  } catch {
    throw new Error("SQS message Body is not valid JSON");
  }
  const body = obj as Partial<IngestMessageBody>;
  if (!body.documentId || !body.attemptId) {
    throw new Error("SQS message Body must include documentId and attemptId");
  }
  return { documentId: body.documentId, attemptId: body.attemptId };
}

async function markFailedBestEffort(params: {
  documentId: string;
  attemptId: string;
  errorCode: string;
  errorMessage: string;
}) {
  const { documentId, attemptId, errorCode, errorMessage } = params;

  try {
    const userId = await prisma.$transaction(async (tx) => {
      // Only fail if attempt exists and is not READY already
      const attempt = await tx.documentIngestionAttempt.findUnique({
        where: { id: attemptId },
        select: { id: true, documentId: true, status: true },
      });

      if (!attempt) return null;
      if (attempt.documentId !== documentId) return null;
      if (attempt.status === "READY") return null;

      // Get userId for publishing
      const doc = await tx.document.findUnique({
        where: { id: documentId },
        select: { userId: true },
      });

      await tx.documentIngestionAttempt.update({
        where: { id: attemptId },
        data: {
          status: "FAILED",
          errorCode,
          errorMessage: errorMessage.slice(0, MAX_ERROR_MESSAGE_LENGTH),
          finishedAt: new Date(),
        },
      });

      await tx.document.update({
        where: { id: documentId },
        data: {
          status: "FAILED",
        },
      });

      return doc?.userId ?? null;
    });

    // Publish FAILED status to Redis for real-time updates
    if (userId) {
      await publishDocumentStatus(userId, documentId, "FAILED", attemptId);
    }
  } catch {
    // swallow: best effort only
  }
}

async function handleMessage(msg: Message) {
  const receiptHandle = msg.ReceiptHandle;
  if (!receiptHandle) throw new Error("SQS message missing ReceiptHandle");

  const { documentId, attemptId } = parseBody(msg.Body);
  console.log(`[worker] Processing doc=${documentId} attempt=${attemptId}`);

  // 1) DB transaction: state machine
  const result = await prisma.$transaction(async (tx) => {
    const attempt = await tx.documentIngestionAttempt.findUnique({
      where: { id: attemptId },
      select: {
        id: true,
        documentId: true,
        status: true,
        startedAt: true,
        finishedAt: true,
      },
    });
    if (!attempt) {
      throw new Error(`Attempt not found: ${attemptId}`);
    }
    if (attempt.documentId !== documentId) {
      throw new Error(`Attempt ${attemptId} does not belong to document ${documentId}`);
    }

    // Get document for userId
    const doc = await tx.document.findUnique({
      where: { id: documentId },
      select: { userId: true },
    });
    if (!doc) {
      throw new Error(`Document not found: ${documentId}`);
    }

    // Idempotency: if already terminal, skip processing
    if (
      attempt.status === "READY" ||
      attempt.status === "FAILED"
    ) {
      return { shouldProcess: false, userId: doc.userId };
    }

    // Only promote INITIATED -> PROCESSING
    if (attempt.status === "INITIATED") {
      await tx.documentIngestionAttempt.update({
        where: { id: attemptId },
        data: {
          status: "PROCESSING",
          startedAt: attempt.startedAt ?? new Date(),
        },
      });
    }

    // Ensure Document status reflects processing
    await tx.document.update({
      where: { id: documentId },
      data: {
        status: "PROCESSING",
      },
    });

    return { shouldProcess: true, userId: doc.userId };
  });

  // Run the ingestion job (PROCESSING status already published by API)
  if (result.shouldProcess) {
    await ingestJob({ documentId, attemptId });
  }

  // 2) Ack SQS only after DB commit
  await sqs.send(
    new DeleteMessageCommand({
      QueueUrl: ENV.SQS_QUEUE_URL,
      ReceiptHandle: receiptHandle,
    })
  );
  console.log(`[worker] Message acknowledged`);
}

async function main() {
  // Basic connectivity check
  await prisma.$connect();

  // Poll forever
  // Note: for local dev you can add a SIGINT handler to disconnect gracefully.
  for (;;) {
    const res = await sqs.send(
      new ReceiveMessageCommand({
        QueueUrl: ENV.SQS_QUEUE_URL,
        MaxNumberOfMessages: SQS_MAX_MESSAGES,
        WaitTimeSeconds: SQS_WAIT_TIME_SECONDS,
        VisibilityTimeout: SQS_VISIBILITY_TIMEOUT_SECONDS,
      })
    );

    const messages = res.Messages ?? [];
    if (messages.length === 0) continue;

    for (const msg of messages) {
      try {
        await handleMessage(msg);
      } catch (err) {
        // Best effort: mark attempt/document failed (so UI reflects reality).
        // Leave message unacked so SQS retries (or DLQ later).
        const body = (() => {
          try {
            return parseBody(msg.Body);
          } catch {
            return null;
          }
        })();

        const errMsg = err instanceof Error ? err.message : "Unknown error";
        if (body) {
          console.error(`[worker] Failed doc=${body.documentId}: ${errMsg}`);
          await markFailedBestEffort({
            documentId: body.documentId,
            attemptId: body.attemptId,
            errorCode: "WORKER_STATE_UPDATE_FAILED",
            errorMessage: errMsg,
          });
        } else {
          console.error(`[worker] Failed to parse message: ${errMsg}`);
        }
      }
    }
  }
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
