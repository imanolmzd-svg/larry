import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "./client.js";

export async function presignPutObject(params: {
  bucket: string;
  key: string;
  contentType?: string;
  expiresInSeconds?: number;
}) {
  const cmd = new PutObjectCommand({
    Bucket: params.bucket,
    Key: params.key,
    // RECOMMENDED: DO NOT set ContentType here to avoid mismatches
    // ContentType: params.contentType,
  });

  const url = await getSignedUrl(s3, cmd, {
    expiresIn: params.expiresInSeconds ?? 60 * 5,
  });

  return url;
}
