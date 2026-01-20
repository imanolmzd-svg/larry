/**
 * Local development worker - long-polling mode.
 *
 * This is for local dev only. In production, use lambda.ts with AWS Lambda triggers.
 * The worker polls SQS, processes messages, and acknowledges them.
 */
import "dotenv/config";
import { prisma } from "@larry/db";
import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  Message,
} from "@aws-sdk/client-sqs";
import {
  processMessage,
  parseBody,
  markFailedBestEffort,
} from "./messageHandler.js";
import {
  SQS_MAX_MESSAGES,
  SQS_WAIT_TIME_SECONDS,
  SQS_VISIBILITY_TIMEOUT_SECONDS,
  SQS_DEFAULT_REGION,
} from "./config/constants.js";
import { ENV } from "./config/env.js";

/**
 * SQS client configured for local (localstack) or AWS SQS (prod).
 * - If SQS_ENDPOINT is set: uses localstack with explicit credentials
 * - If SQS_ENDPOINT is NOT set: uses AWS SQS with IAM role
 */
const sqs = new SQSClient({
  region: ENV.SQS_REGION ?? SQS_DEFAULT_REGION,
  endpoint: ENV.SQS_ENDPOINT,
  // Only provide credentials when running against localstack (endpoint set)
  ...(ENV.SQS_ENDPOINT && ENV.SQS_ACCESS_KEY_ID && ENV.SQS_SECRET_ACCESS_KEY
    ? {
        credentials: {
          accessKeyId: ENV.SQS_ACCESS_KEY_ID,
          secretAccessKey: ENV.SQS_SECRET_ACCESS_KEY,
        },
      }
    : {}),
});

/**
 * Handle a single SQS message in local dev mode.
 * Processes the message and acknowledges it on success.
 */
async function handleMessage(msg: Message, queueUrl: string): Promise<void> {
  const receiptHandle = msg.ReceiptHandle;
  if (!receiptHandle) throw new Error("SQS message missing ReceiptHandle");

  // Process the message using shared logic
  await processMessage(msg.Body ?? "");

  // Ack SQS only after successful processing
  await sqs.send(
    new DeleteMessageCommand({
      QueueUrl: queueUrl,
      ReceiptHandle: receiptHandle,
    })
  );
  console.log(`[worker] Message acknowledged`);
}

/**
 * Main polling loop for local development.
 */
async function main(): Promise<void> {
  // Validate that SQS_QUEUE_URL is set for poller mode
  if (!ENV.SQS_QUEUE_URL) {
    console.error("❌ SQS_QUEUE_URL is required for local poller mode");
    console.error("   For Lambda with SQS trigger, use lambda.ts instead");
    process.exit(1);
  }

  const queueUrl = ENV.SQS_QUEUE_URL; // Now guaranteed to be defined

  // Basic connectivity check
  await prisma.$connect();
  console.log("[worker] Connected to database, starting poll loop...");

  // Poll forever
  // Note: for local dev you can add a SIGINT handler to disconnect gracefully.
  for (;;) {
    const res = await sqs.send(
      new ReceiveMessageCommand({
        QueueUrl: queueUrl,
        MaxNumberOfMessages: SQS_MAX_MESSAGES,
        WaitTimeSeconds: SQS_WAIT_TIME_SECONDS,
        VisibilityTimeout: SQS_VISIBILITY_TIMEOUT_SECONDS,
      })
    );

    const messages = res.Messages ?? [];
    if (messages.length === 0) continue;

    for (const msg of messages) {
      try {
        await handleMessage(msg, queueUrl);
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
  console.error(e);
  process.exit(1);
});
