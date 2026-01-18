// apps/worker/src/main.ts
import "dotenv/config";
import { prisma } from "@larry/db";
import { DocumentIngestionAttemptStatus, DocumentStatus } from "@larry/db/src/generated/prisma/enums.js";
import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  Message,
} from "@aws-sdk/client-sqs";

type IngestMessageBody = {
  documentId: string;
  attemptId: string;
};


function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

const SQS_REGION = process.env.SQS_REGION ?? "us-east-1";
const SQS_QUEUE_URL = requiredEnv("SQS_QUEUE_URL");

// LocalStack support: set SQS_ENDPOINT=http://localhost:4566
const SQS_ENDPOINT = process.env.SQS_ENDPOINT;

const sqs = new SQSClient({
  region: SQS_REGION,
  endpoint: SQS_ENDPOINT,
  credentials: {
    accessKeyId: process.env.SQS_ACCESS_KEY_ID ?? "test",
    secretAccessKey: process.env.SQS_SECRET_ACCESS_KEY ?? "test",
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
    await prisma.$transaction(async (tx) => {
      // Only fail if attempt exists and is not READY already
      const attempt = await tx.documentIngestionAttempt.findUnique({
        where: { id: attemptId },
        select: { id: true, documentId: true, status: true },
      });

      if (!attempt) return;
      if (attempt.documentId !== documentId) return;
      if (attempt.status === DocumentIngestionAttemptStatus.READY) return;

      await tx.documentIngestionAttempt.update({
        where: { id: attemptId },
        data: {
          status: DocumentIngestionAttemptStatus.FAILED,
          errorCode,
          errorMessage: errorMessage.slice(0, 4000),
          finishedAt: new Date(),
        },
      });

      await tx.document.update({
        where: { id: documentId },
        data: {
          status: DocumentStatus.FAILED,
        },
      });
    });
  } catch {
    // swallow: best effort only
  }
}

async function handleMessage(msg: Message) {
  const receiptHandle = msg.ReceiptHandle;
  if (!receiptHandle) throw new Error("SQS message missing ReceiptHandle");

  const { documentId, attemptId } = parseBody(msg.Body);
  console.log("HandleMessage: Parsed documentId:", documentId, "and attemptId:", attemptId);
  // 1) DB transaction: state machine
  await prisma.$transaction(async (tx) => {
    console.log("transaction started");
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
    console.log("attempt belongs to document", documentId);
    // Idempotency: if already terminal, do nothing
    if (
      attempt.status === DocumentIngestionAttemptStatus.READY ||
      attempt.status === DocumentIngestionAttemptStatus.FAILED
    ) {
      console.log("attempt.status is terminal", attempt.status);
      return;
    }

    // Only promote INITIATED -> PROCESSING
    if (attempt.status === DocumentIngestionAttemptStatus.INITIATED) {
      console.log("attempt.status === DocumentIngestionAttemptStatus.INITIATED");
      await tx.documentIngestionAttempt.update({
        where: { id: attemptId },
        data: {
          status: DocumentIngestionAttemptStatus.PROCESSING,
          startedAt: attempt.startedAt ?? new Date(),
          // optional: progress: 0
        },
      });
    }

    // Ensure Document status reflects processing
    console.log("updating document status to PROCESSING", documentId);
    await tx.document.update({
      where: { id: documentId },
      data: {
        status: DocumentStatus.PROCESSING,
      },
    });
  });

  // 2) Ack SQS only after DB commit
  console.log("deleting message from SQS");
  await sqs.send(
    new DeleteMessageCommand({
      QueueUrl: SQS_QUEUE_URL,
      ReceiptHandle: receiptHandle,
    })
  );
}

async function main() {
  // Basic connectivity check
  await prisma.$connect();

  // Poll forever
  // Note: for local dev you can add a SIGINT handler to disconnect gracefully.
  for (;;) {
    const res = await sqs.send(
      new ReceiveMessageCommand({
        QueueUrl: SQS_QUEUE_URL,
        MaxNumberOfMessages: 5,
        WaitTimeSeconds: 20, // long poll
        VisibilityTimeout: 60, // give ourselves time to process
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

        if (body) {
          await markFailedBestEffort({
            documentId: body.documentId,
            attemptId: body.attemptId,
            errorCode: "WORKER_STATE_UPDATE_FAILED",
            errorMessage: err instanceof Error ? err.message : "Unknown error",
          });
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
