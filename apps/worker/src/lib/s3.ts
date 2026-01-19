import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "node:stream";
import { ENV } from "../config/env.js";

const s3 = new S3Client({
  region: ENV.S3_REGION,
  endpoint: ENV.S3_PUBLIC_ENDPOINT,
  forcePathStyle: !!ENV.S3_PUBLIC_ENDPOINT, // required for many MinIO/LocalStack setups
  credentials: {
    accessKeyId: ENV.S3_ACCESS_KEY,
    secretAccessKey: ENV.S3_SECRET_KEY,
  },
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
