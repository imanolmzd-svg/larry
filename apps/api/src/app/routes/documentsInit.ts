import type { Request, Response } from "express";
import { prisma } from "@larry/db";
import { randomUUID } from "node:crypto";
import { presignPutObject } from "../../infra/s3/presignPut.js";
import { S3_BUCKET_NAME } from "../../infra/s3/client.js";
import { DocumentStatus } from "@larry/db/src/generated/prisma/enums.js";

function buildS3Key(userId: string) {
  // Keep it opaque + stable; include userId for easy bucket browsing.
  return `users/${userId}/uploads/${randomUUID()}`;
}

export async function postDocumentsInit(req: Request, res: Response) {
  // const userId = req.auth.userId as string;
  const userId = "1"; // ##todo: add auth
  const { filename, mimeType, sizeBytes } = req.body ?? {};

  const s3Key = buildS3Key(userId);

  const document = await prisma.document.create({
    data: {
      userId,
      status: DocumentStatus.CREATED,
      filename: filename ?? null,
      mimeType: mimeType ?? null,
      size: typeof sizeBytes === "number" ? BigInt(sizeBytes) : null,
      storageKey: s3Key,
    },
    select: { id: true, storageKey: true },
  });

  const uploadUrl = await presignPutObject({
    bucket: S3_BUCKET_NAME,
    key: document.storageKey,
    contentType: typeof mimeType === "string" ? mimeType : undefined,
    expiresInSeconds: 60 * 10,
  });

  res.json({ documentId: document.id, uploadUrl });
}