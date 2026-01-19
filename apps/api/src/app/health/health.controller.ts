import { Request, Response } from "express";
import pg from "pg";
import { Redis } from "ioredis";
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";
import { ENV } from "../../config/env.js";

export async function healthHandler(_req: Request, res: Response) {
  const errors: string[] = [];

  // Check Postgres
  try {
    const client = new pg.Client({ connectionString: ENV.DATABASE_URL });
    await client.connect();
    await client.query("SELECT 1");
    await client.end();
  } catch (err) {
    errors.push(`postgres: ${err instanceof Error ? err.message : "unknown error"}`);
  }

  // Check Redis
  if (!ENV.REDIS_URL) {
    errors.push("redis: REDIS_URL is not set");
  } else {
    try {
      const redis = new Redis(ENV.REDIS_URL);
      await redis.ping();
      redis.disconnect();
    } catch (err) {
      errors.push(`redis: ${err instanceof Error ? err.message : "unknown error"}`);
    }
  }

  // Check S3/MinIO
  if (!ENV.S3_PUBLIC_ENDPOINT || !ENV.S3_ACCESS_KEY || !ENV.S3_SECRET_KEY) {
    const missing = [
      !ENV.S3_PUBLIC_ENDPOINT && "S3_ENDPOINT",
      !ENV.S3_ACCESS_KEY && "S3_KEY",
      !ENV.S3_SECRET_KEY && "S3_SECRET",
    ].filter(Boolean).join(", ");
    errors.push(`s3: missing env vars: ${missing}`);
  } else {
    try {
      const s3 = new S3Client({
        endpoint: ENV.S3_PUBLIC_ENDPOINT,
        credentials: {
          accessKeyId: ENV.S3_ACCESS_KEY,
          secretAccessKey: ENV.S3_SECRET_KEY,
        },
        region: ENV.S3_REGION,
        forcePathStyle: true,
      });
      await s3.send(new ListBucketsCommand({}));
      s3.destroy();
    } catch (err) {
      errors.push(`s3: ${err instanceof Error ? err.message : "unknown error"}`);
    }
  }

  if (errors.length > 0) {
    res.status(500).json({ status: "error", errors });
  } else {
    res.json({ status: "ok" });
  }
}

