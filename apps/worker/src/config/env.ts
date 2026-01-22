/**
 * Centralized environment configuration for the Worker.
 * All environment variables must be accessed through this module.
 * Validates required variables at startup and provides typed access.
 */
import { z } from "zod";

const envSchema = z.object({

  // Environment
  NODE_ENV: z.enum(["development", "production"]).default("development"),

  // Redis (optional - status updates disabled if not set)
  REDIS_URL: z.string().optional(),

  // S3/MinIO
  S3_PROVIDER: z.enum(["aws", "minio"]).default("minio"),
  S3_BUCKET: z.string().min(1, "S3_BUCKET is required"),
  S3_REGION: z.string().default("us-east-1"),
  S3_PUBLIC_ENDPOINT: z.string().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),

  // SQS
  SQS_QUEUE_URL: z.string().min(1, "SQS_QUEUE_URL is required"),
  SQS_REGION: z.string().optional(),
  SQS_ENDPOINT: z.string().optional(),
  SQS_ACCESS_KEY_ID: z.string().default("test"),
  SQS_SECRET_ACCESS_KEY: z.string().default("test"),

  // OpenAI
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
  OPENAI_EMBEDDINGS_MODEL: z.string().default("text-embedding-3-small"),
});

function validateEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    console.error("❌ Environment validation failed:\n" + errors);
    process.exit(1);
  }

  return result.data;
}

/**
 * Validated environment variables.
 * Access all env vars through this object.
 */
export const ENV = validateEnv();
