import type { Response } from "express";
import type { AuthRequest } from "../../infra/middleware/auth.js";
import { prisma } from "@larry/db";
import { askQuestion } from "../../domain/chat/chatService.js";

export async function postChatAsk(req: AuthRequest, res: Response) {
  const userId = req.userId!; // Guaranteed by middleware

  // Check user limits
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { questionsAsked: true },
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  if (user.questionsAsked >= 10) {
    return res.status(403).json({
      error: "Question limit reached. You have asked 10/10 questions.",
    });
  }

  const { question } = req.body ?? {};

  if (!question || typeof question !== "string") {
    return res.status(400).json({ error: "question is required" });
  }

  try {
    const result = await askQuestion(question, userId);

    // Increment questions asked counter
    await prisma.user.update({
      where: { id: userId },
      data: { questionsAsked: { increment: 1 } },
    });

    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[chat] Error:`, err);
    res.status(500).json({ error: message });
  }
}
