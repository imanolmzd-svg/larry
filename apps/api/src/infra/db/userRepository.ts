import { prisma } from "@larry/db";
import type { UserAuthRepository } from "../../domain/auth/ports.js";

export const userAuthRepository: UserAuthRepository = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, password: true },
    });
  },
};
