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

/**
 * Lambda handler for SQS events.
 *
 * @param event - SQS event containing message records
 * @returns Batch response with any failed message IDs
 */
export async function handler(event: SQSEvent): Promise<SQSBatchResponse> {
  console.log(`[lambda] Received ${event.Records.length} message(s)`);

  const batchItemFailures: SQSBatchItemFailure[] = [];

  for (const record of event.Records) {
    try {
      await processMessage(record.body);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Unknown error";
      console.error(`[lambda] Failed to process message ${record.messageId}: ${errMsg}`);

      // Best effort: mark attempt/document failed (so UI reflects reality)
      try {
        const body = parseBody(record.body);
        await markFailedBestEffort({
          documentId: body.documentId,
          attemptId: body.attemptId,
          errorCode: "LAMBDA_PROCESSING_FAILED",
          errorMessage: errMsg,
        });
      } catch {
        // Could not parse body or mark failed - just log
        console.error(`[lambda] Could not mark message as failed: ${record.messageId}`);
      }

      // Report this message as failed so it returns to the queue
      batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  }

  console.log(
    `[lambda] Completed: ${event.Records.length - batchItemFailures.length} success, ${batchItemFailures.length} failed`
  );

  return { batchItemFailures };
}
