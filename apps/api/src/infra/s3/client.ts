import { S3Client } from "@aws-sdk/client-s3";
import { ENV } from "../../config/env.js";

export const s3 = new S3Client({
  region: ENV.S3_REGION,
  endpoint: ENV.S3_PUBLIC_ENDPOINT,
  credentials: ENV.S3_ACCESS_KEY && ENV.S3_SECRET_KEY ? {
    accessKeyId: ENV.S3_ACCESS_KEY,
    secretAccessKey: ENV.S3_SECRET_KEY,
  } : undefined,
  forcePathStyle: true, // IMPORTANT for MinIO
});

export const S3_BUCKET_NAME = ENV.S3_BUCKET;
