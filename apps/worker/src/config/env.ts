/**
 * Centralized environment configuration for the Worker.
 * All environment variables must be accessed through this module.
 * Validates required variables at startup and provides typed access.
 */
import { z } from "zod";

const envSchema = z.object({
  // Redis (optional - status updates disabled if not set)
  REDIS_URL: z.string().optional(),

  // S3/MinIO - Dual mode support:
  // - If S3_ENDPOINT is set: MinIO mode (requires S3_ACCESS_KEY, S3_SECRET_KEY)
  // - If S3_ENDPOINT is NOT set: AWS mode (uses IAM role, no credentials needed)
  S3_BUCKET: z.string().min(1, "S3_BUCKET is required"),
  AWS_REGION: z.string().default("us-east-1"),
  S3_ENDPOINT: z.string().optional(),
  S3_FORCE_PATH_STYLE: z.string().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),

  // SQS - Only required for local poller mode (index.ts)
  // Lambda with SQS trigger (lambda.ts) does NOT need SQS_QUEUE_URL
  SQS_QUEUE_URL: z.string().optional(),
  SQS_REGION: z.string().optional(),
  SQS_ENDPOINT: z.string().optional(),
  SQS_ACCESS_KEY_ID: z.string().optional(),
  SQS_SECRET_ACCESS_KEY: z.string().optional(),

  // OpenAI
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
  OPENAI_EMBEDDINGS_MODEL: z.string().default("text-embedding-3-small"),

  // Debug
  ENABLE_DEBUG_LOGS: z.string().optional().transform(val => val === "true"),
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

  const data = result.data;

  // Conditional validation: if S3_ENDPOINT is set, require credentials
  if (data.S3_ENDPOINT) {
    if (!data.S3_ACCESS_KEY || !data.S3_SECRET_KEY) {
      console.error(
        "❌ Environment validation failed:\n" +
          "  - S3_ACCESS_KEY and S3_SECRET_KEY are required when S3_ENDPOINT is set (MinIO mode)"
      );
      process.exit(1);
    }
  }

  return data;
}

/**
 * Validated environment variables.
 * Access all env vars through this object.
 */
export const ENV = validateEnv();
