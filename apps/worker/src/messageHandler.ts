/**
 * Shared message handling logic for SQS messages.
 * Used by both local dev (index.ts) and Lambda handler (lambda.ts).
 */
import { prisma } from "@larry/db";
import { DocumentIngestionAttemptStatus, DocumentStatus } from "@larry/db/src/generated/prisma/enums.js";
import { ingestJob } from "./ingestJob.js";
import { publishDocumentStatus } from "./lib/redisProgress.js";
import { MAX_ERROR_MESSAGE_LENGTH } from "./config/constants.js";
import { debug, info, error } from "./lib/logger.js";

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
  debug("[parseBody]", "Parsing message body");
  
  if (!raw) {
    error("[parseBody]", "SQS message has empty Body");
    throw new Error("SQS message has empty Body");
  }
  
  let obj: unknown;
  try {
    obj = JSON.parse(raw);
    debug("[parseBody]", "Message body parsed successfully", { body: obj });
  } catch (parseErr) {
    error("[parseBody]", "SQS message Body is not valid JSON", parseErr);
    throw new Error("SQS message Body is not valid JSON");
  }
  
  const body = obj as Partial<IngestMessageBody>;
  if (!body.documentId || !body.attemptId) {
    error("[parseBody]", "Missing required fields", { body });
    throw new Error("SQS message Body must include documentId and attemptId");
  }
  
  debug("[parseBody]", "Message body validated", {
    documentId: body.documentId,
    attemptId: body.attemptId,
  });
  
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

  debug("[markFailed]", "Starting best-effort failure marking", {
    documentId,
    attemptId,
    errorCode,
  });

  try {
    const userId = await prisma.$transaction(async (tx) => {
      debug("[markFailed]", "Fetching attempt from DB");
      
      // Only fail if attempt exists and is not READY already
      const attempt = await tx.documentIngestionAttempt.findUnique({
        where: { id: attemptId },
        select: { id: true, documentId: true, status: true },
      });

      if (!attempt) {
        debug("[markFailed]", "Attempt not found, skipping");
        return null;
      }
      if (attempt.documentId !== documentId) {
        debug("[markFailed]", "Attempt/document mismatch, skipping");
        return null;
      }
      if (attempt.status === DocumentIngestionAttemptStatus.READY) {
        debug("[markFailed]", "Attempt already READY, skipping");
        return null;
      }

      debug("[markFailed]", "Fetching document from DB");
      
      // Get userId for publishing
      const doc = await tx.document.findUnique({
        where: { id: documentId },
        select: { userId: true },
      });

      debug("[markFailed]", "Updating attempt status to FAILED");
      
      await tx.documentIngestionAttempt.update({
        where: { id: attemptId },
        data: {
          status: DocumentIngestionAttemptStatus.FAILED,
          errorCode,
          errorMessage: errorMessage.slice(0, MAX_ERROR_MESSAGE_LENGTH),
          finishedAt: new Date(),
        },
      });

      debug("[markFailed]", "Updating document status to FAILED");
      
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
      debug("[markFailed]", "Publishing FAILED status to Redis", { userId });
      await publishDocumentStatus(userId, documentId, "FAILED", attemptId);
    }
    
    info("[markFailed]", "Failure marked successfully", { documentId, attemptId });
  } catch (markErr) {
    error("[markFailed]", "Failed to mark as failed (best effort)", markErr);
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
  info("[processMessage]", "Starting message processing", { documentId, attemptId });

  // DB transaction: state machine
  debug("[processMessage]", "Beginning DB transaction for state transition");
  
  const result = await prisma.$transaction(async (tx) => {
    debug("[processMessage]", "Fetching attempt from DB");
    
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
      error("[processMessage]", "Attempt not found", { attemptId });
      throw new Error(`Attempt not found: ${attemptId}`);
    }
    
    if (attempt.documentId !== documentId) {
      error("[processMessage]", "Attempt/document mismatch", {
        attemptId,
        expectedDocId: documentId,
        actualDocId: attempt.documentId,
      });
      throw new Error(`Attempt ${attemptId} does not belong to document ${documentId}`);
    }

    debug("[processMessage]", "Attempt found", {
      status: attempt.status,
      startedAt: attempt.startedAt,
      finishedAt: attempt.finishedAt,
    });

    // Get document for userId
    debug("[processMessage]", "Fetching document from DB");
    
    const doc = await tx.document.findUnique({
      where: { id: documentId },
      select: { userId: true },
    });
    
    if (!doc) {
      error("[processMessage]", "Document not found", { documentId });
      throw new Error(`Document not found: ${documentId}`);
    }

    debug("[processMessage]", "Document found", { userId: doc.userId });

    // Idempotency: if already terminal, skip processing
    if (
      attempt.status === DocumentIngestionAttemptStatus.READY ||
      attempt.status === DocumentIngestionAttemptStatus.FAILED
    ) {
      info("[processMessage]", "Attempt already in terminal state, skipping", {
        status: attempt.status,
      });
      return { shouldProcess: false, userId: doc.userId };
    }

    // Only promote INITIATED -> PROCESSING
    if (attempt.status === DocumentIngestionAttemptStatus.INITIATED) {
      debug("[processMessage]", "Transitioning INITIATED -> PROCESSING");
      
      await tx.documentIngestionAttempt.update({
        where: { id: attemptId },
        data: {
          status: DocumentIngestionAttemptStatus.PROCESSING,
          startedAt: attempt.startedAt ?? new Date(),
        },
      });
    } else {
      debug("[processMessage]", "Attempt already in PROCESSING state");
    }

    // Ensure Document status reflects processing
    debug("[processMessage]", "Updating document status to PROCESSING");
    
    await tx.document.update({
      where: { id: documentId },
      data: {
        status: DocumentStatus.PROCESSING,
      },
    });

    return { shouldProcess: true, userId: doc.userId };
  });

  debug("[processMessage]", "DB transaction complete", {
    shouldProcess: result.shouldProcess,
  });

  // Run the ingestion job (PROCESSING status already published by API)
  if (result.shouldProcess) {
    info("[processMessage]", "Starting ingestion job");
    await ingestJob({ documentId, attemptId });
  } else {
    info("[processMessage]", "Skipping ingestion job (already processed)");
  }

  info("[processMessage]", "Message processing complete", { documentId, attemptId });
}
