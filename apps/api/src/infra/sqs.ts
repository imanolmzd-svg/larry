import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const { SQS_REGION, SQS_ENDPOINT, SQS_QUEUE_URL } = process.env;

if (!SQS_QUEUE_URL) throw new Error("Missing SQS_QUEUE_URL");

export const sqs = new SQSClient({
  region: SQS_REGION || "us-east-1",
  endpoint: SQS_ENDPOINT,
  // LocalStack does not require real credentials, but SDK wants something.
  credentials: {
    accessKeyId: process.env.SQS_ACCESS_KEY_ID || "test",
    secretAccessKey: process.env.SQS_SECRET_ACCESS_KEY || "test",
  },
});

export async function enqueueIngestionMessage(payload: { documentId: string; attemptId: string }) {
  const cmd = new SendMessageCommand({
    QueueUrl: SQS_QUEUE_URL,
    MessageBody: JSON.stringify(payload),
    // Optional: group/dedupe only if FIFO queue
    // MessageGroupId: payload.documentId,
    // MessageDeduplicationId: payload.attemptId,
  });

  await sqs.send(cmd);
}