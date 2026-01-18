import type { Response } from "express";
import type { AuthRequest } from "../../infra/middleware/auth.js";
import { prisma } from "@larry/db";
import { randomUUID } from "node:crypto";
import { presignPutObject } from "../../infra/s3/presignPut.js";
import { S3_BUCKET_NAME } from "../../infra/s3/client.js";
import { DocumentStatus } from "@larry/db/src/generated/prisma/enums.js";

function buildS3Key(userId: string, filename?: string) {
  // Keep it opaque + stable; include userId for easy bucket browsing.
  const ext = filename?.match(/\.[^.]+$/)?.[0] ?? "";
  return `users/${userId}/uploads/${randomUUID()}${ext}`;
}

export async function postDocumentsInit(req: AuthRequest, res: Response) {
  const userId = req.userId!; // Guaranteed by middleware
  const { filename, mimeType, sizeBytes } = req.body ?? {};

  // Validate filename is provided
  if (!filename || typeof filename !== "string") {
    return res.status(400).json({ error: "filename is required" });
  }

  // Check for duplicate filename
  const existingDoc = await prisma.document.findFirst({
    where: {
      userId,
      filename,
    },
  });

  if (existingDoc) {
    return res.status(409).json({ error: "A file with this name already exists" });
  }

  const s3Key = buildS3Key(userId, filename);

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