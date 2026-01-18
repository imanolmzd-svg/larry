import type { Response } from "express";
import type { AuthRequest } from "../../infra/middleware/auth.js";
import { prisma } from "@larry/db";
import { deleteS3Object } from "../../infra/s3/deleteObject.js";

export async function deleteDocument(req: AuthRequest, res: Response) {
  const userId = req.userId!; // Guaranteed by middleware
  const { documentId } = req.body ?? {};

  if (!documentId || typeof documentId !== "string") {
    return res.status(400).json({ error: "documentId is required" });
  }

  try {
    // Find document and verify ownership
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: { id: true, userId: true, storageKey: true },
    });

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    if (document.userId !== userId) {
      return res.status(403).json({ error: "Not authorized to delete this document" });
    }

    // Delete from S3
    try {
      await deleteS3Object(document.storageKey);
    } catch (err) {
      console.error(`[documents] Failed to delete S3 object ${document.storageKey}:`, err);
      // Continue with database deletion even if S3 delete fails
    }

    // Delete from database (cascades to attempts and chunks)
    await prisma.document.delete({
      where: { id: documentId },
    });

    console.log(`[documents] Deleted document ${documentId} for user ${userId}`);
    res.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[documents] Error deleting document:`, err);
    res.status(500).json({ error: message });
  }
}
