import type { Response } from "express";
import type { AuthRequest } from "../../infra/middleware/auth.js";
import { prisma } from "@larry/db";
import { DocumentStatus } from "@larry/db";

export async function getDocuments(req: AuthRequest, res: Response) {
  const userId = req.userId!; // Guaranteed by middleware

  try {
    // Return all documents regardless of status for real-time UI updates
    const documents = await prisma.document.findMany({
      where: {
        userId,
        status: {
          in: [
            DocumentStatus.CREATED,
            DocumentStatus.UPLOADED,
            DocumentStatus.PROCESSING,
            DocumentStatus.READY,
            DocumentStatus.FAILED,
          ],
        },
      },
      select: {
        id: true,
        filename: true,
        status: true,
        size: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Convert BigInt to number for JSON serialization
    const serializedDocs = documents.map((doc) => ({
      ...doc,
      size: doc.size ? Number(doc.size) : null,
    }));

    res.json(serializedDocs);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[documents] Error fetching documents:`, err);
    res.status(500).json({ error: message });
  }
}
