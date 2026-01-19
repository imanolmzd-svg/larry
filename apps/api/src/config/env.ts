/**
 * Centralized environment configuration for the API.
 * All environment variables must be accessed through this module.
 * Validates required variables at startup and provides typed access.
 */
import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // Redis (optional - WebSocket updates disabled if not set)
  REDIS_URL: z.string().optional(),

  // S3/MinIO
  S3_BUCKET: z.string().min(1, "S3_BUCKET is required"),
  S3_REGION: z.string().default("us-east-1"),
  S3_PUBLIC_ENDPOINT: z.string().optional(),
  S3_INTERNAL_ENDPOINT: z.string().optional(),
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
  OPENAI_CHAT_MODEL: z.string().default("gpt-4o-mini"),

  // Auth
  JWT_SECRET: z.string().default("your-secret-key-change-in-production"),
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

/**
 * Check if a variable is set (for logging purposes).
 * Does not expose the actual value.
 */
export function isEnvSet(key: keyof typeof ENV): boolean {
  return ENV[key] !== undefined && ENV[key] !== "";
}

/**
 * Get env status for startup logging (safe - never prints secrets).
 */
export function getEnvStatus(): Record<string, "set" | "missing"> {
  return {
    DATABASE_URL: isEnvSet("DATABASE_URL") ? "set" : "missing",
    REDIS_URL: isEnvSet("REDIS_URL") ? "set" : "missing",
    S3_INTERNAL_ENDPOINT: isEnvSet("S3_INTERNAL_ENDPOINT") ? "set" : "missing",
    S3_PUBLIC_ENDPOINT: isEnvSet("S3_PUBLIC_ENDPOINT") ? "set" : "missing",
    S3_ACCESS_KEY: isEnvSet("S3_ACCESS_KEY") ? "set" : "missing",
    S3_SECRET_KEY: isEnvSet("S3_SECRET_KEY") ? "set" : "missing",
    SQS_QUEUE_URL: isEnvSet("SQS_QUEUE_URL") ? "set" : "missing",
    SQS_REGION: isEnvSet("SQS_REGION") ? "set" : "missing",
    SQS_ACCESS_KEY_ID: isEnvSet("SQS_ACCESS_KEY_ID") ? "set" : "missing",
    SQS_SECRET_ACCESS_KEY: isEnvSet("SQS_SECRET_ACCESS_KEY") ? "set" : "missing",
  };
}
