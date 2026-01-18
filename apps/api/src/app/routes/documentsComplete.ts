
import type { Request, Response } from "express";
import { prisma } from "@larry/db";
import { S3_BUCKET_NAME } from "../../infra/s3/client.js";
import { headObject } from "../../infra/s3/head.js";
import { DocumentIngestionAttemptStatus, DocumentStatus } from "@larry/db/src/generated/prisma/enums.js";
import { enqueueIngestionMessage } from "../../infra/sqs.js";





export async function postDocumentsComplete(req: Request, res: Response) {

  // const userId = req.auth.userId as string;
  const userId = "1"; // ##todo: add auth

  const { documentId } = req.body ?? {};

  if (!documentId || typeof documentId !== "string") {
    return res.status(400).json({ error: "documentId is required" });
  }

  // Transaction for DB state; do S3 HEAD before or after.
  const doc = await prisma.document.findFirst({
    where: { id: documentId, userId },
    select: { id: true, storageKey: true, status: true },
  });

  if (!doc) return res.status(404).json({ error: "Document not found" });

  // Guard: only allow complete from uploading/pending states
  if (doc.status !== DocumentStatus.CREATED && doc.status !== DocumentStatus.UPLOADED) {
    // Idempotent-ish: if already processing/ready, just return ok
    if (doc.status === DocumentStatus.PROCESSING || doc.status === DocumentStatus.READY) return res.json({ ok: true });
    return res.status(409).json({ error: `Invalid status: ${doc.status}` });
  }

  // Verify object exists in S3
  try {
    await headObject({ bucket: S3_BUCKET_NAME, key: doc.storageKey });
  } catch {
    return res.status(400).json({ error: "Object not found in S3 for this document" });
  }

  // Create attempt + move document to processing atomically
  const { attemptId } = await prisma.$transaction(async (tx) => {
    const attempt = await tx.documentIngestionAttempt.create({
      data: {
        documentId: doc.id,
        status: DocumentIngestionAttemptStatus.INITIATED,
      },
      select: { id: true },
    });

    await tx.document.update({
      where: { id: doc.id },
      data: { status: DocumentStatus.PROCESSING },
      select: { id: true },
    });

    return { attemptId: attempt.id };
  });

  // Enqueue after commit (simple + good enough for MVP).
  // If you later want stronger guarantees: Outbox pattern.
  await enqueueIngestionMessage({ documentId: doc.id, attemptId });

  res.json({ ok: true });
}