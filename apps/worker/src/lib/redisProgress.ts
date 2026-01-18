import { Redis } from "ioredis";

const REDIS_URL = process.env.REDIS_URL;

const redis = REDIS_URL ? new Redis(REDIS_URL) : null;

type ProgressPayload = {
  documentId: string;
  attemptId: string;
  stage: string;
  progress: number;
};

export async function publishProgress(userId: string, payload: ProgressPayload): Promise<void> {
  if (!redis) return;

  const channel = `ingestion:user:${userId}`;
  const key = `ingestion:doc:${payload.documentId}`;

  const msg = JSON.stringify(payload);

  await Promise.all([
    redis.publish(channel, msg),
    redis.set(key, msg, "EX", 60 * 30), // keep latest progress for 30m
  ]);
}
