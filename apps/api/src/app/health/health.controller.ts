import { Request, Response } from "express";
import pg from "pg";
import { HeadBucketCommand } from "@aws-sdk/client-s3";
import { ENV } from "../../config/env.js";
import { s3, S3_BUCKET_NAME } from "../../infra/s3/client.js";

/**
 * Health check endpoint.
 * Checks Postgres and S3 connectivity.
 * NOTE: Redis is intentionally NOT checked here to avoid connection issues on Lambda.
 * Redis failures are handled gracefully by the application (returns null/false).
 */
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

  // Check S3 - works for both MinIO and AWS S3
  // Uses HeadBucket as a lightweight connectivity check
  try {
    await s3.send(new HeadBucketCommand({ Bucket: S3_BUCKET_NAME }));
  } catch (err) {
    const mode = ENV.S3_ENDPOINT ? "minio" : "aws";
    errors.push(`s3 (${mode}): ${err instanceof Error ? err.message : "unknown error"}`);
  }

  if (errors.length > 0) {
    res.status(500).json({ status: "error", errors });
  } else {
    res.json({ status: "ok" });
  }
}

