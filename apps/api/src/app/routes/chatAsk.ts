import type { Request, Response } from "express";
import { askQuestion } from "../../domain/chat/chatService.js";

export async function postChatAsk(req: Request, res: Response) {
  // Extract userId (hardcoded for MVP, matches other routes)
  const userId = "1"; // ##todo: add auth

  const { question } = req.body ?? {};

  if (!question || typeof question !== "string") {
    return res.status(400).json({ error: "question is required" });
  }

  try {
    const result = await askQuestion(question, userId);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[chat] Error:`, err);
    res.status(500).json({ error: message });
  }
}
