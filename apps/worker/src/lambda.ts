/**
 * AWS Lambda handler for SQS-triggered worker.
 *
 * This handler receives SQS events directly from AWS Lambda triggers.
 * It does NOT poll SQS - AWS Lambda provides messages automatically.
 *
 * Uses partial batch failure reporting: successful messages are deleted,
 * failed messages return to the queue for retry.
 */
import type { SQSEvent, SQSBatchResponse, SQSBatchItemFailure } from "aws-lambda";
import { processMessage, parseBody, markFailedBestEffort } from "./messageHandler.js";
import { debug, info, error } from "./lib/logger.js";

/**
 * Lambda handler for SQS events.
 *
 * @param event - SQS event containing message records
 * @returns Batch response with any failed message IDs
 */
export async function handler(event: SQSEvent): Promise<SQSBatchResponse> {
  info("[lambda]", `Handler invoked with ${event.Records.length} message(s)`);
  debug("[lambda]", "Event details", { recordCount: event.Records.length });

  const batchItemFailures: SQSBatchItemFailure[] = [];

  for (let i = 0; i < event.Records.length; i++) {
    const record = event.Records[i]!;
    debug("[lambda]", `Processing message ${i + 1}/${event.Records.length}`, {
      messageId: record.messageId,
      attempt: record.attributes.ApproximateReceiveCount,
    });

    try {
      await processMessage(record.body);
      debug("[lambda]", `Message ${record.messageId} processed successfully`);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Unknown error";
      error("[lambda]", `Failed to process message ${record.messageId}`, err);

      // Best effort: mark attempt/document failed (so UI reflects reality)
      try {
        const body = parseBody(record.body);
        debug("[lambda]", "Marking message as failed in DB", {
          documentId: body.documentId,
          attemptId: body.attemptId,
        });
        await markFailedBestEffort({
          documentId: body.documentId,
          attemptId: body.attemptId,
          errorCode: "LAMBDA_PROCESSING_FAILED",
          errorMessage: errMsg,
        });
      } catch (markErr) {
        error("[lambda]", `Could not mark message as failed: ${record.messageId}`, markErr);
      }

      // Report this message as failed so it returns to the queue
      batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  }

  const successCount = event.Records.length - batchItemFailures.length;
  const failureCount = batchItemFailures.length;

  info("[lambda]", `Batch completed: ${successCount} success, ${failureCount} failed`);
  
  if (failureCount > 0) {
    debug("[lambda]", "Failed message IDs", {
      failedIds: batchItemFailures.map(f => f.itemIdentifier),
    });
  }

  return { batchItemFailures };
}
