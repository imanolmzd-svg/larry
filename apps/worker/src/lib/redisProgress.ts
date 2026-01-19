import { getRedisPublisher, safeRedisPublish } from "@larry/infra";
import {
  createDocumentStatusEvent,
  getRedisChannel,
  type DocumentStatusType,
} from "@larry/shared";
import { ENV } from "../config/env.js";

/**
 * Publishes a document status change to Redis for real-time updates.
 * Uses lazy client creation and safe error handling (never throws).
 */
export async function publishDocumentStatus(
  userId: string,
  documentId: string,
  status: DocumentStatusType,
  attemptId?: string
): Promise<void> {
  const client = getRedisPublisher(ENV.REDIS_URL);
  if (!client) {
    console.log(`[redis] No REDIS_URL, skipping publish status=${status} doc=${documentId}`);
    return;
  }

  const event = createDocumentStatusEvent(documentId, userId, status, attemptId);
  const channel = getRedisChannel(userId);
  const msg = JSON.stringify(event);

  const success = await safeRedisPublish(client, channel, msg);
  if (success) {
    console.log(`[redis] Published status=${status} to channel=${channel}`);
  } else {
    console.log(`[redis] Failed to publish status=${status} to channel=${channel}`);
  }
}
