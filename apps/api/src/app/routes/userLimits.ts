import type { Response } from "express";
import type { AuthRequest } from "../../infra/middleware/auth.js";
import { prisma } from "@larry/db";
import { USER_DOCUMENT_LIMIT, USER_QUESTION_LIMIT } from "../../config/constants.js";

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
      limit: USER_DOCUMENT_LIMIT,
      remaining: USER_DOCUMENT_LIMIT - user.documentsUploaded,
    },
    questions: {
      used: user.questionsAsked,
      limit: USER_QUESTION_LIMIT,
      remaining: USER_QUESTION_LIMIT - user.questionsAsked,
    },
  });
}
