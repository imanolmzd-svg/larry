import { S3Client } from "@aws-sdk/client-s3";

const {
  S3_PUBLIC_ENDPOINT,
  S3_REGION,
  S3_ACCESS_KEY,
  S3_SECRET_KEY,
  S3_BUCKET,
} = process.env;

if (!S3_BUCKET) throw new Error("Missing S3_BUCKET");

export const s3 = new S3Client({
  region: S3_REGION || "us-east-1",
  endpoint: S3_PUBLIC_ENDPOINT,
  credentials: S3_ACCESS_KEY && S3_SECRET_KEY ? {
    accessKeyId: S3_ACCESS_KEY,
    secretAccessKey: S3_SECRET_KEY,
  } : undefined,
  forcePathStyle: true, // IMPORTANT for MinIO
});

export const S3_BUCKET_NAME = S3_BUCKET;
