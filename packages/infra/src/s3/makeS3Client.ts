/**
 * S3 client factory that works for both MinIO (local) and AWS S3 (prod).
 *
 * - If S3_ENDPOINT is set: uses MinIO mode with explicit credentials
 * - If S3_ENDPOINT is NOT set: uses AWS mode with IAM role (no credentials needed)
 */
import { S3Client } from "@aws-sdk/client-s3";

/**
 * Configuration for creating an S3 client.
 */
export interface S3ClientConfig {
  /** AWS region (e.g., "eu-west-1") */
  region: string;

  /** Optional S3-compatible endpoint (e.g., MinIO URL). If not set, uses AWS S3. */
  endpoint?: string;

  /** Access key ID. Required if endpoint is set. */
  accessKeyId?: string;

  /** Secret access key. Required if endpoint is set. */
  secretAccessKey?: string;

  /** Force path-style URLs (required for MinIO). Defaults to true when endpoint is set. */
  forcePathStyle?: boolean;
}

/**
 * Helper to parse boolean-like strings ("true", "1") to boolean.
 */
export function parseBoolEnv(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined || value === "") {
    return defaultValue;
  }
  return value === "true" || value === "1";
}

/**
 * Creates an S3 client configured for either MinIO (local) or AWS S3 (prod).
 *
 * @param config - S3 client configuration
 * @returns Configured S3Client instance
 *
 * @example
 * // MinIO (local dev)
 * const s3 = makeS3Client({
 *   region: "us-east-1",
 *   endpoint: "http://localhost:9000",
 *   accessKeyId: "minio",
 *   secretAccessKey: "minio123",
 * });
 *
 * @example
 * // AWS S3 (prod with IAM role)
 * const s3 = makeS3Client({
 *   region: "eu-west-1",
 * });
 */
export function makeS3Client(config: S3ClientConfig): S3Client {
  const { region, endpoint, accessKeyId, secretAccessKey, forcePathStyle } = config;

  // AWS mode: no endpoint means use AWS S3 with IAM role credentials
  if (!endpoint) {
    return new S3Client({
      region,
      // No credentials - AWS SDK will use IAM role or default credential chain
    });
  }

  // MinIO mode: endpoint is set, require credentials
  if (!accessKeyId || !secretAccessKey) {
    throw new Error(
      "S3 credentials (accessKeyId, secretAccessKey) are required when S3_ENDPOINT is set"
    );
  }

  return new S3Client({
    region,
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    // Default to true for MinIO compatibility, can be overridden
    forcePathStyle: forcePathStyle ?? true,
  });
}

/**
 * Check if we're in AWS mode (no custom endpoint).
 */
export function isAwsMode(endpoint?: string): boolean {
  return !endpoint;
}
