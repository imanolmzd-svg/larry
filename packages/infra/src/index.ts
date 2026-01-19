// S3 client factory
export {
  makeS3Client,
  parseBoolEnv,
  isAwsMode,
} from "./s3/makeS3Client.js";
export type { S3ClientConfig } from "./s3/makeS3Client.js";
