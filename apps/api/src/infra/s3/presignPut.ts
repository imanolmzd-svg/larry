import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "./client.js";
import { PRESIGN_URL_EXPIRES_SECONDS } from "../../config/constants.js";

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
    expiresIn: params.expiresInSeconds ?? PRESIGN_URL_EXPIRES_SECONDS,
  });

  return url;
}
