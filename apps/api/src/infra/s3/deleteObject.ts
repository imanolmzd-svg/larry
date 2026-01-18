import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3, S3_BUCKET_NAME } from "./client.js";

export async function deleteS3Object(key: string): Promise<void> {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
    })
  );
}
