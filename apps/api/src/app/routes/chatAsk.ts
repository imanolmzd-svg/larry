import type { Request, Response } from "express";

export async function postChatAsk(req: Request, res: Response) {
  const { question } = req.body ?? {};

  if (!question || typeof question !== "string") {
    return res.status(400).json({ error: "question is required" });
  }

  // Hardcoded response for MVP
  res.json({
    answer: "This is a test response. The RAG pipeline will be connected later.",
    sources: [
      {
        documentId: "test-doc-1",
        documentName: "Sample Document.pdf",
        page: 1,
        snippet: "This is a sample snippet from the document..."
      }
    ]
  });
}
