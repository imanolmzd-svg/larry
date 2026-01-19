import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { SQS_DEFAULT_REGION } from "../config/constants.js";
import { ENV } from "../config/env.js";

export const sqs = new SQSClient({
  region: ENV.SQS_REGION || SQS_DEFAULT_REGION,
  endpoint: ENV.SQS_ENDPOINT,
  credentials: {
    accessKeyId: ENV.SQS_ACCESS_KEY_ID,
    secretAccessKey: ENV.SQS_SECRET_ACCESS_KEY,
  },
});

export async function enqueueIngestionMessage(payload: { documentId: string; attemptId: string }) {
  const cmd = new SendMessageCommand({
    QueueUrl: ENV.SQS_QUEUE_URL,
    MessageBody: JSON.stringify(payload),
    // Optional: group/dedupe only if FIFO queue
    // MessageGroupId: payload.documentId,
    // MessageDeduplicationId: payload.attemptId,
  });

  await sqs.send(cmd);
}