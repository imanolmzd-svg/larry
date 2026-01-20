/**
 * Centralized logging utilities for the worker.
 * Debug logs are controlled by ENABLE_DEBUG_LOGS environment variable.
 */
import { ENV } from "../config/env.js";

/**
 * Log debug information only if ENABLE_DEBUG_LOGS is true.
 * Always use console.log for production logs (errors, important events).
 */
export function debug(prefix: string, message: string, data?: Record<string, unknown>): void {
  if (!ENV.ENABLE_DEBUG_LOGS) return;
  
  const timestamp = new Date().toISOString();
  const dataStr = data ? ` ${JSON.stringify(data)}` : "";
  console.log(`[DEBUG ${timestamp}] ${prefix} ${message}${dataStr}`);
}

/**
 * Log info (always shown).
 */
export function info(prefix: string, message: string, data?: Record<string, unknown>): void {
  const timestamp = new Date().toISOString();
  const dataStr = data ? ` ${JSON.stringify(data)}` : "";
  console.log(`[INFO ${timestamp}] ${prefix} ${message}${dataStr}`);
}

/**
 * Log error (always shown).
 */
export function error(prefix: string, message: string, err?: unknown): void {
  const timestamp = new Date().toISOString();
  const errorDetails = err instanceof Error 
    ? { message: err.message, stack: err.stack }
    : { error: String(err) };
  console.error(`[ERROR ${timestamp}] ${prefix} ${message}`, errorDetails);
}

/**
 * Log warning (always shown).
 */
export function warn(prefix: string, message: string, data?: Record<string, unknown>): void {
  const timestamp = new Date().toISOString();
  const dataStr = data ? ` ${JSON.stringify(data)}` : "";
  console.warn(`[WARN ${timestamp}] ${prefix} ${message}${dataStr}`);
}
