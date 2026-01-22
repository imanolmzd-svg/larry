import { S3Client } from "@aws-sdk/client-s3";
import { ENV } from "../../config/env.js";

// Configure S3Client based on S3_PROVIDER
// "minio": custom endpoint, forcePathStyle, custom credentials
// "aws": default endpoint, no forcePathStyle, IAM credentials
let s3: S3Client;

if (ENV.S3_PROVIDER === "minio") {
  s3 = new S3Client({
    region: ENV.S3_REGION,
    endpoint: ENV.S3_PUBLIC_ENDPOINT,
    forcePathStyle: true,
    credentials: ENV.S3_ACCESS_KEY && ENV.S3_SECRET_KEY ? {
      accessKeyId: ENV.S3_ACCESS_KEY,
      secretAccessKey: ENV.S3_SECRET_KEY,
    } : undefined,
  });
} else {
  // AWS S3
  s3 = new S3Client({
    region: ENV.S3_REGION,
    // No endpoint, no forcePathStyle, no explicit credentials (uses IAM)
  });
}

export { s3 };
export const S3_BUCKET_NAME = ENV.S3_BUCKET;
