import { S3Client } from "@aws-sdk/client-s3";


export const s3 = new S3Client({
  region: process.env.S3_REGION || "us-east-1",
  endpoint: process.env.S3_PUBLIC_ENDPOINT, // ej: http://localhost:9000
  forcePathStyle: true, // IMPORTANTE para MinIO
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
});
