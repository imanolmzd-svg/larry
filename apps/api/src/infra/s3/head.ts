import { HeadObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "./client.js";

export async function headObject(args: { bucket: string; key: string }) {
  const cmd = new HeadObjectCommand({ Bucket: args.bucket, Key: args.key });
  return s3.send(cmd);
}