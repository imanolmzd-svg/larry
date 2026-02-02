import { describe, expect, it, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { login, verifyToken } from "../authService.js";
import type { UserAuthRepository, AuthUserRecord } from "../ports.js";

// The ENV is already set via vitest.config.ts env vars
// JWT_SECRET = "test-secret-for-testing"

describe("authService", () => {
  describe("login", () => {
    const makeUser = (overrides: Partial<AuthUserRecord> = {}): AuthUserRecord => ({
      id: "user-123",
      email: "test@example.com",
      password: bcrypt.hashSync("correct-password", 10),
      ...overrides,
    });

    const makeRepo = (user: AuthUserRecord | null = null): UserAuthRepository => ({
      findByEmail: vi.fn().mockResolvedValue(user),
    });

    it("throws error when user not found", async () => {
      const repo = makeRepo(null);

      await expect(login("unknown@example.com", "password", repo)).rejects.toThrow(
        "Invalid credentials"
      );
    });

    it("throws error when user has no email", async () => {
      const repo = makeRepo(makeUser({ email: null }));

      await expect(login("test@example.com", "password", repo)).rejects.toThrow(
        "Invalid credentials"
      );
    });

    it("throws error when password is incorrect", async () => {
      const repo = makeRepo(makeUser());

      await expect(login("test@example.com", "wrong-password", repo)).rejects.toThrow(
        "Invalid credentials"
      );
    });

    it("returns token and user on successful login", async () => {
      const user = makeUser();
      const repo = makeRepo(user);

      const result = await login("test@example.com", "correct-password", repo);

      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe("string");
      expect(result.user).toEqual({
        id: "user-123",
        email: "test@example.com",
      });
    });

    it("generates valid JWT token", async () => {
      const user = makeUser();
      const repo = makeRepo(user);

      const result = await login("test@example.com", "correct-password", repo);

      // Verify the token is valid and contains expected payload
      const decoded = jwt.verify(result.token, "test-secret-for-testing") as {
        userId: string;
        email: string;
      };
      expect(decoded.userId).toBe("user-123");
      expect(decoded.email).toBe("test@example.com");
    });

    it("calls repository with correct email", async () => {
      const repo = makeRepo(null);

      try {
        await login("test@example.com", "password", repo);
      } catch {
        // Expected to throw
      }

      expect(repo.findByEmail).toHaveBeenCalledWith("test@example.com");
    });
  });

  describe("verifyToken", () => {
    it("returns payload for valid token", () => {
      const token = jwt.sign(
        { userId: "user-456", email: "user@test.com" },
        "test-secret-for-testing"
      );

      const result = verifyToken(token);

      expect(result.userId).toBe("user-456");
      expect(result.email).toBe("user@test.com");
    });

    it("throws error for invalid token", () => {
      expect(() => verifyToken("invalid-token")).toThrow("Invalid token");
    });

    it("throws error for token with wrong secret", () => {
      const token = jwt.sign({ userId: "user-1" }, "different-secret");

      expect(() => verifyToken(token)).toThrow("Invalid token");
    });

    it("throws error for expired token", () => {
      const token = jwt.sign(
        { userId: "user-1", email: "test@test.com" },
        "test-secret-for-testing",
        { expiresIn: "-1s" }
      );

      expect(() => verifyToken(token)).toThrow("Invalid token");
    });
  });
});
