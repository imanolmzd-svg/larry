/**
 * Shared message handling logic for SQS messages.
 * Used by both local dev (index.ts) and Lambda handler (lambda.ts).
 */
import { prisma } from "@larry/db";
import { DocumentIngestionAttemptStatus, DocumentStatus } from "@larry/db/src/generated/prisma/enums.js";
import { ingestJob } from "./ingestJob.js";
import { publishDocumentStatus } from "./lib/redisProgress.js";
import { MAX_ERROR_MESSAGE_LENGTH } from "./config/constants.js";

/**
 * Message body structure from SQS.
 */
export type IngestMessageBody = {
  documentId: string;
  attemptId: string;
};

/**
 * Parse and validate SQS message body.
 */
export function parseBody(raw: string | undefined): IngestMessageBody {
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

/**
 * Best-effort failure marking.
 * Updates attempt and document status to FAILED without throwing.
 */
export async function markFailedBestEffort(params: {
  documentId: string;
  attemptId: string;
  errorCode: string;
  errorMessage: string;
}): Promise<void> {
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
      if (attempt.status === DocumentIngestionAttemptStatus.READY) return null;

      // Get userId for publishing
      const doc = await tx.document.findUnique({
        where: { id: documentId },
        select: { userId: true },
      });

      await tx.documentIngestionAttempt.update({
        where: { id: attemptId },
        data: {
          status: DocumentIngestionAttemptStatus.FAILED,
          errorCode,
          errorMessage: errorMessage.slice(0, MAX_ERROR_MESSAGE_LENGTH),
          finishedAt: new Date(),
        },
      });

      await tx.document.update({
        where: { id: documentId },
        data: {
          status: DocumentStatus.FAILED,
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

/**
 * Process a single ingestion message.
 * This is the core logic shared between local dev and Lambda.
 *
 * @param messageBody - Raw SQS message body (JSON string)
 * @throws Error if processing fails (caller should handle failure marking)
 */
export async function processMessage(messageBody: string): Promise<void> {
  const { documentId, attemptId } = parseBody(messageBody);
  console.log(`[worker] Processing doc=${documentId} attempt=${attemptId}`);

  // DB transaction: state machine
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
      attempt.status === DocumentIngestionAttemptStatus.READY ||
      attempt.status === DocumentIngestionAttemptStatus.FAILED
    ) {
      return { shouldProcess: false, userId: doc.userId };
    }

    // Only promote INITIATED -> PROCESSING
    if (attempt.status === DocumentIngestionAttemptStatus.INITIATED) {
      await tx.documentIngestionAttempt.update({
        where: { id: attemptId },
        data: {
          status: DocumentIngestionAttemptStatus.PROCESSING,
          startedAt: attempt.startedAt ?? new Date(),
        },
      });
    }

    // Ensure Document status reflects processing
    await tx.document.update({
      where: { id: documentId },
      data: {
        status: DocumentStatus.PROCESSING,
      },
    });

    return { shouldProcess: true, userId: doc.userId };
  });

  // Run the ingestion job (PROCESSING status already published by API)
  if (result.shouldProcess) {
    await ingestJob({ documentId, attemptId });
  }

  console.log(`[worker] Processed doc=${documentId} attempt=${attemptId}`);
}
