// S3 client factory
export {
  makeS3Client,
  parseBoolEnv,
  isAwsMode,
} from "./s3/makeS3Client.js";
export type { S3ClientConfig } from "./s3/makeS3Client.js";

// Redis client factory (serverless-optimized for Lambda/Upstash)
export {
  getRedisPublisher,
  getRedisSubscriber,
  safeRedisPublish,
  safeRedisSubscribe,
  safeRedisUnsubscribe,
} from "./redis/makeRedisClient.js";
export type { RedisClientConfig } from "./redis/makeRedisClient.js";
