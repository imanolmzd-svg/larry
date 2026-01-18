import { Request, Response } from "express";
import pg from "pg";
import { Redis } from "ioredis";
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";

export async function healthHandler(_req: Request, res: Response) {

  const errors: string[] = [];

  // Check Postgres
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    errors.push("postgres: DATABASE_URL is not set");
  } else {
    try {
      const client = new pg.Client({ connectionString: databaseUrl });
      await client.connect();
      await client.query("SELECT 1");
      await client.end();
    } catch (err) {
      errors.push(`postgres: ${err instanceof Error ? err.message : "unknown error"}`);
    }
  }

  // Check Redis
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    errors.push("redis: REDIS_URL is not set");
  } else {
    try {
      const redis = new Redis(redisUrl);
      await redis.ping();
      redis.disconnect();
    } catch (err) {
      errors.push(`redis: ${err instanceof Error ? err.message : "unknown error"}`);
    }
  }

  // Check S3/MinIO
  const s3Endpoint = process.env.S3_PUBLIC_ENDPOINT;
  const s3Key = process.env.S3_ACCESS_KEY;
  const s3Secret = process.env.S3_SECRET_KEY;

  if (!s3Endpoint || !s3Key || !s3Secret) {
    const missing = [
      !s3Endpoint && "S3_ENDPOINT",
      !s3Key && "S3_KEY",
      !s3Secret && "S3_SECRET",
    ].filter(Boolean).join(", ");
    errors.push(`s3: missing env vars: ${missing}`);
  } else {
    try {
      const s3 = new S3Client({
        endpoint: s3Endpoint,
        credentials: {
          accessKeyId: s3Key,
          secretAccessKey: s3Secret,
        },
        region: "us-east-1",
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

