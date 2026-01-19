/**
 * Centralized environment configuration for the Web app.
 * Only NEXT_PUBLIC_* variables are exposed to client code.
 * Server secrets must NEVER be imported here.
 */

import { DEFAULT_API_URL } from "./constants";

/**
 * Public environment variables accessible in the browser.
 * These are embedded at build time by Next.js.
 */
export const ENV = {
  /** API base URL for all backend requests */
  API_URL: process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL,
} as const;
