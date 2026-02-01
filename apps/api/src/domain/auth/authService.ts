import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { JWTPayload, LoginResponse } from "./types.js";
import type { UserAuthRepository } from "./ports.js";
import { JWT_EXPIRES_IN } from "../../config/constants.js";
import { ENV } from "../../config/env.js";

export async function login(
  email: string,
  password: string,
  userRepo: UserAuthRepository
): Promise<LoginResponse> {
  // Find user by email
  const user = await userRepo.findByEmail(email);

  if (!user || !user.email) {
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

  const token = jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

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
    return jwt.verify(token, ENV.JWT_SECRET) as JWTPayload;
  } catch {
    throw new Error("Invalid token");
  }
}
