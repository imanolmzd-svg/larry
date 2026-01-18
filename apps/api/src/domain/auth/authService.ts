import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@larry/db";
import type { JWTPayload, LoginResponse } from "./types.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d";

export async function login(email: string, password: string): Promise<LoginResponse> {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, password: true }
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  // Compare password
  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    throw new Error("Invalid credentials");
  }

  // Generate JWT
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  return {
    token,
    user: {
      id: user.id,
      email: user.email
    }
  };
}

export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    throw new Error("Invalid token");
  }
}
