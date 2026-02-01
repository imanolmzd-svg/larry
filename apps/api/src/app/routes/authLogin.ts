import type { Request, Response } from "express";
import { login } from "../../domain/auth/authService.js";
import { userAuthRepository } from "../../infra/db/userRepository.js";

export async function postAuthLogin(req: Request, res: Response) {
  const { email, password } = req.body ?? {};

  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Email is required" });
  }

  if (!password || typeof password !== "string") {
    return res.status(400).json({ error: "Password is required" });
  }

  try {
    const result = await login(email, password, userAuthRepository);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[auth] Login error:", message);
    res.status(401).json({ error: "Invalid credentials" });
  }
}
