/**
 * Redis client factory optimized for AWS Lambda with Upstash.
 *
 * Features:
 * - Lazy client creation (no top-level connections)
 * - Serverless-optimized configuration (fast timeouts, no offline queue)
 * - TLS support for rediss:// URLs
 * - Error handling that returns null/false instead of throwing
 */
import { Redis, RedisOptions } from "ioredis";

/**
 * Configuration for creating a Redis client.
 */
export interface RedisClientConfig {
  /** Redis URL (redis:// or rediss:// for TLS) */
  url: string;
  /** Connection timeout in ms. Default: 2000 (fast fail for Lambda) */
  connectTimeout?: number;
  /** Max retries per request. Default: 1 (don't hang on failures) */
  maxRetriesPerRequest?: number;
  /** Queue commands when disconnected. Default: false (fail immediately) */
  enableOfflineQueue?: boolean;
}

// Singleton clients - one for publish, one for subscribe (Redis requires separate connections)
let publishClient: Redis | null = null;
let subscribeClient: Redis | null = null;

/**
 * Creates serverless-optimized Redis options.
 */
function createRedisOptions(config: RedisClientConfig): RedisOptions {
  const isTls = config.url.startsWith("rediss://");

  return {
    // Serverless-optimized settings
    connectTimeout: config.connectTimeout ?? 2000,
    maxRetriesPerRequest: config.maxRetriesPerRequest ?? 1,
    enableOfflineQueue: config.enableOfflineQueue ?? false,
    lazyConnect: true,

    // Quick retry strategy: 2 attempts max, then give up
    retryStrategy: (times: number) => {
      if (times > 2) return null; // Stop retrying
      return Math.min(times * 100, 500); // 100ms, 200ms
    },

    // TLS for Upstash (rediss:// URLs)
    ...(isTls ? { tls: {} } : {}),
  };
}

/**
 * Sets up error handler to prevent unhandled rejection crashes.
 */
function setupErrorHandler(client: Redis, label: string): void {
  client.on("error", (err) => {
    console.error(`[redis:${label}] Error:`, err.message);
  });
}

/**
 * Gets or creates a lazy Redis client for publishing.
 * Returns null if URL is not provided.
 */
export function getRedisPublisher(url: string | undefined): Redis | null {
  if (!url) return null;

  if (!publishClient) {
    publishClient = new Redis(url, createRedisOptions({ url }));
    setupErrorHandler(publishClient, "publisher");
  }

  return publishClient;
}

/**
 * Gets or creates a lazy Redis client for subscribing.
 * Separate from publisher because Redis requires different connections for pub/sub.
 * Returns null if URL is not provided.
 */
export function getRedisSubscriber(url: string | undefined): Redis | null {
  if (!url) return null;

  if (!subscribeClient) {
    subscribeClient = new Redis(url, createRedisOptions({ url }));
    setupErrorHandler(subscribeClient, "subscriber");
  }

  return subscribeClient;
}

/**
 * Safe wrapper for Redis publish that catches errors.
 * Returns true on success, false on failure (never throws).
 */
export async function safeRedisPublish(
  redis: Redis | null,
  channel: string,
  message: string
): Promise<boolean> {
  if (!redis) return false;

  try {
    await redis.publish(channel, message);
    return true;
  } catch (err) {
    console.error(
      "[redis] Publish failed:",
      err instanceof Error ? err.message : err
    );
    return false;
  }
}

/**
 * Safe wrapper for Redis subscribe that catches errors.
 * Returns true on success, false on failure (never throws).
 */
export async function safeRedisSubscribe(
  redis: Redis | null,
  channel: string
): Promise<boolean> {
  if (!redis) return false;

  try {
    await redis.subscribe(channel);
    return true;
  } catch (err) {
    console.error(
      "[redis] Subscribe failed:",
      err instanceof Error ? err.message : err
    );
    return false;
  }
}

/**
 * Safe wrapper for Redis unsubscribe that catches errors.
 * Returns true on success, false on failure (never throws).
 */
export async function safeRedisUnsubscribe(
  redis: Redis | null,
  channel: string
): Promise<boolean> {
  if (!redis) return false;

  try {
    await redis.unsubscribe(channel);
    return true;
  } catch (err) {
    console.error(
      "[redis] Unsubscribe failed:",
      err instanceof Error ? err.message : err
    );
    return false;
  }
}
