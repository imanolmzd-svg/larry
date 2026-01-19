import { Redis } from "ioredis";
import {
  createDocumentStatusEvent,
  getRedisChannel,
  type DocumentStatusType,
} from "@larry/shared";
import { ENV } from "../config/env.js";

const redis = ENV.REDIS_URL ? new Redis(ENV.REDIS_URL) : null;

export async function publishDocumentStatus(
  userId: string,
  documentId: string,
  status: DocumentStatusType,
  attemptId?: string
): Promise<void> {
  if (!redis) {
    console.log(`[redis] No REDIS_URL, skipping publish status=${status} doc=${documentId}`);
    return;
  }

  const event = createDocumentStatusEvent(documentId, userId, status, attemptId);
  const channel = getRedisChannel(userId);
  const msg = JSON.stringify(event);

  await redis.publish(channel, msg);
  console.log(`[redis] Published status=${status} to channel=${channel}`);
}
