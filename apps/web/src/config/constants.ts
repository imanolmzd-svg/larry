/**
 * Web App Configuration Constants
 * Centralized configuration values to avoid magic numbers throughout the codebase.
 */

// =============================================================================
// WebSocket Configuration
// =============================================================================

/** Maximum reconnection attempts for WebSocket */
export const WS_RECONNECTION_ATTEMPTS = 10;

/** Initial delay between reconnection attempts in milliseconds */
export const WS_RECONNECTION_DELAY_MS = 1000;

/** Maximum delay between reconnection attempts in milliseconds */
export const WS_RECONNECTION_DELAY_MAX_MS = 5000;

// =============================================================================
// Polling Configuration
// =============================================================================

/** Interval for polling document status updates when WebSocket is unavailable (in milliseconds) */
export const DOCUMENT_POLL_INTERVAL_MS = 3000;

// =============================================================================
// API Configuration
// =============================================================================

/** Default API URL for local development */
export const DEFAULT_API_URL = "http://localhost:4000";
