"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const handleSubmit = (e: React.FormEvent) => {
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

    // If no errors, the form is valid (but don't do anything yet)
    if (Object.keys(newErrors).length === 0) {
      console.log("Form is valid (no action yet)");
    }
  };

  return (
    <main style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Login</h1>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label
            htmlFor="email"
            style={{
              display: "block",
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 6,
              color: "#374151"
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
              border: `1px solid ${errors.email ? "#ef4444" : "#d1d5db"}`,
              borderRadius: 6,
              fontSize: 14,
              outline: "none",
            }}
          />
          {errors.email && (
            <p style={{ color: "#ef4444", fontSize: 13, marginTop: 4 }}>
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
              color: "#374151"
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
              border: `1px solid ${errors.password ? "#ef4444" : "#d1d5db"}`,
              borderRadius: 6,
              fontSize: 14,
              outline: "none",
            }}
          />
          {errors.password && (
            <p style={{ color: "#ef4444", fontSize: 13, marginTop: 4 }}>
              {errors.password}
            </p>
          )}
        </div>

        <button
          type="submit"
          style={{
            padding: "10px 16px",
            background: "#111827",
            color: "white",
            border: "none",
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            marginTop: 8,
          }}
        >
          Login
        </button>
      </form>
    </main>
  );
}
