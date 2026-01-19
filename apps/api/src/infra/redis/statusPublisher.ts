import { Redis } from "ioredis";
import {
  createDocumentStatusEvent,
  getRedisChannel,
  type DocumentStatusType,
} from "@larry/shared";

const REDIS_URL = process.env.REDIS_URL;

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (!REDIS_URL) return null;
  if (!redis) {
    redis = new Redis(REDIS_URL);
  }
  return redis;
}

export async function publishDocumentStatus(
  userId: string,
  documentId: string,
  status: DocumentStatusType,
  attemptId?: string
): Promise<void> {
  const client = getRedis();
  if (!client) {
    console.log(`[redis] No REDIS_URL, skipping publish status=${status} doc=${documentId}`);
    return;
  }

  const event = createDocumentStatusEvent(documentId, userId, status, attemptId);
  const channel = getRedisChannel(userId);
  const msg = JSON.stringify(event);

  await client.publish(channel, msg);
  console.log(`[redis] Published status=${status} to channel=${channel}`);
}
