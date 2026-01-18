import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "node:stream";

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

const S3_REGION = process.env.S3_REGION ?? "us-east-1";
const S3_ENDPOINT = process.env.S3_PUBLIC_ENDPOINT;
const S3_BUCKET = requiredEnv("S3_BUCKET");

const s3 = new S3Client({
  region: S3_REGION,
  endpoint: S3_ENDPOINT,
  forcePathStyle: !!S3_ENDPOINT, // required for many MinIO/LocalStack setups
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY ?? "test",
    secretAccessKey: process.env.S3_SECRET_KEY ?? "test",
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
      Bucket: S3_BUCKET,
      Key: storageKey,
    })
  );

  if (!res.Body) throw new Error("S3 GetObject returned empty body");
  return streamToBuffer(res.Body as Readable);
}
