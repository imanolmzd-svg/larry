/**
 * API Configuration Constants
 * Centralized configuration values to avoid magic numbers throughout the codebase.
 */

import { ENV } from "./env.js";

// =============================================================================
// Server Configuration
// =============================================================================

/** Port the API server listens on */
export const SERVER_PORT = 4000;

/** Host the API server binds to */
export const SERVER_HOST = "0.0.0.0";

/** Allowed CORS origins for web client */
export const CORS_ORIGIN = (() => {
  const origins = ["http://localhost:3000"];
  if (ENV.WEB_URL) {
    origins.push(ENV.WEB_URL);
  }
  return origins;
})();

// =============================================================================
// Authentication
// =============================================================================

/** JWT token expiration time */
export const JWT_EXPIRES_IN = "7d";

// =============================================================================
// User Limits
// =============================================================================

/** Maximum documents a user can upload */
export const USER_DOCUMENT_LIMIT = 10;

/** Maximum questions a user can ask */
export const USER_QUESTION_LIMIT = 10;

// =============================================================================
// Chat / RAG Configuration
// =============================================================================

/** Maximum length of a user question in characters */
export const MAX_QUESTION_LENGTH = 2000;

/** Default number of similar chunks to retrieve for RAG */
export const DEFAULT_CHUNK_RETRIEVAL_LIMIT = 5;

// =============================================================================
// S3 Configuration
// =============================================================================

/** Default presigned URL expiration time in seconds (5 minutes) */
export const PRESIGN_URL_EXPIRES_SECONDS = 300;

// =============================================================================
// SQS Configuration
// =============================================================================

/** Default AWS region for SQS */
export const SQS_DEFAULT_REGION = "us-east-1";
