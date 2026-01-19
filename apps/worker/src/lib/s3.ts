import { GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "node:stream";
import { makeS3Client, parseBoolEnv } from "@larry/infra";
import { ENV } from "../config/env.js";

/**
 * S3 client configured for MinIO (local) or AWS S3 (prod).
 * - If S3_ENDPOINT is set: uses MinIO with explicit credentials
 * - If S3_ENDPOINT is NOT set: uses AWS S3 with IAM role
 */
const s3 = makeS3Client({
  region: ENV.AWS_REGION,
  endpoint: ENV.S3_ENDPOINT,
  accessKeyId: ENV.S3_ACCESS_KEY,
  secretAccessKey: ENV.S3_SECRET_KEY,
  forcePathStyle: parseBoolEnv(ENV.S3_FORCE_PATH_STYLE, true),
});

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export async function downloadToBuffer(storageKey: string): Promise<Buffer> {
  const res = await s3.send(
    new GetObjectCommand({
      Bucket: ENV.S3_BUCKET,
      Key: storageKey,
    })
  );

  if (!res.Body) throw new Error("S3 GetObject returned empty body");
  return streamToBuffer(res.Body as Readable);
}
