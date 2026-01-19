"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/shared/auth";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (!validatePassword(password)) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);

    // If no errors, attempt login
    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        await login(email, password);
      } catch {
        setErrors({ email: "Invalid credentials" });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <main style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: "var(--color-text-primary)" }}>Login</h1>

      <p style={{
        fontSize: 13,
        color: "var(--color-text-secondary)",
        marginBottom: 24,
        lineHeight: 1.5
      }}>
        Access is restricted to specific accounts. To learn more, visit{" "}
        <Link
          href="/about"
          style={{
            color: "#2563eb",
            textDecoration: "none",
            fontWeight: 500
          }}
        >
          About this project
        </Link>
        .
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label
            htmlFor="email"
            style={{
              display: "block",
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 6,
              color: "var(--color-text-primary)"
            }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: `1px solid ${errors.email ? "var(--error-text)" : "var(--input-border)"}`,
              borderRadius: 6,
              fontSize: 14,
              outline: "none",
              background: "var(--card-bg)",
              color: "var(--color-text-primary)",
            }}
          />
          {errors.email && (
            <p style={{ color: "var(--error-text)", fontSize: 13, marginTop: 4 }}>
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            style={{
              display: "block",
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 6,
              color: "var(--color-text-primary)"
            }}
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: `1px solid ${errors.password ? "var(--error-text)" : "var(--input-border)"}`,
              borderRadius: 6,
              fontSize: 14,
              outline: "none",
              background: "var(--card-bg)",
              color: "var(--color-text-primary)",
            }}
          />
          {errors.password && (
            <p style={{ color: "var(--error-text)", fontSize: 13, marginTop: 4 }}>
              {errors.password}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: "10px 16px",
            background: isLoading ? "var(--button-disabled)" : "var(--button-primary)",
            color: "white",
            border: "none",
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 600,
            cursor: isLoading ? "not-allowed" : "pointer",
            marginTop: 8,
          }}
        >
          {isLoading ? "..." : "Login"}
        </button>
      </form>
    </main>
  );
}
