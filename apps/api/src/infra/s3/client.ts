import { makeS3Client, parseBoolEnv } from "@larry/infra";
import { ENV } from "../../config/env.js";

/**
 * Shared S3 client configured for MinIO (local) or AWS S3 (prod).
 * - If S3_ENDPOINT is set: uses MinIO with explicit credentials
 * - If S3_ENDPOINT is NOT set: uses AWS S3 with IAM role
 */
export const s3 = makeS3Client({
  region: ENV.AWS_REGION,
  endpoint: ENV.S3_ENDPOINT,
  accessKeyId: ENV.S3_ACCESS_KEY,
  secretAccessKey: ENV.S3_SECRET_KEY,
  forcePathStyle: parseBoolEnv(ENV.S3_FORCE_PATH_STYLE, true),
});

export const S3_BUCKET_NAME = ENV.S3_BUCKET;
