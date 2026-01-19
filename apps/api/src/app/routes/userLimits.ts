import type { Response } from "express";
import type { AuthRequest } from "../../infra/middleware/auth.js";
import { prisma } from "@larry/db";

export async function getUserLimits(req: AuthRequest, res: Response) {
  const userId = req.userId!;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      documentsUploaded: true,
      questionsAsked: true,
    },
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({
    documents: {
      used: user.documentsUploaded,
      limit: 10,
      remaining: 10 - user.documentsUploaded,
    },
    questions: {
      used: user.questionsAsked,
      limit: 10,
      remaining: 10 - user.questionsAsked,
    },
  });
}
