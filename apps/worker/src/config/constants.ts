/**
 * Worker Configuration Constants
 * Centralized configuration values to avoid magic numbers throughout the codebase.
 */

// =============================================================================
// SQS Polling Configuration
// =============================================================================

/** Maximum messages to receive per SQS poll */
export const SQS_MAX_MESSAGES = 5;

/** Long poll wait time in seconds */
export const SQS_WAIT_TIME_SECONDS = 20;

/** Message visibility timeout in seconds (time to process before retry) */
export const SQS_VISIBILITY_TIMEOUT_SECONDS = 60;

/** Default AWS region for SQS */
export const SQS_DEFAULT_REGION = "us-east-1";

// =============================================================================
// Document Processing Configuration
// =============================================================================

/** Maximum error message length to store in database */
export const MAX_ERROR_MESSAGE_LENGTH = 4000;

// =============================================================================
// Chunking Configuration
// =============================================================================

/** Target tokens per chunk for text splitting */
export const CHUNK_TARGET_TOKENS = 800;

/** Overlap tokens between chunks for context continuity */
export const CHUNK_OVERLAP_TOKENS = 120;

/** Approximate characters per token (rough estimate for chunk sizing) */
export const CHARS_PER_TOKEN = 4;

// =============================================================================
// Embeddings Configuration
// =============================================================================

/** Batch size for embedding API calls */
export const EMBEDDING_BATCH_SIZE = 64;
