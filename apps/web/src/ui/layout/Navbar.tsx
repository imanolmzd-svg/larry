"use client";

import Link from "next/link";
import { useAuth } from "@/shared/auth";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav
      style={{
        borderBottom: "1px solid #e5e7eb",
        padding: "16px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Link
        href="/"
        style={{
          fontSize: 20,
          fontWeight: 700,
          textDecoration: "none",
          color: "#111827",
        }}
      >
        Larry
      </Link>

      <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
        <Link
          href="/about"
          style={{
            textDecoration: "none",
            color: "#4b5563",
            fontSize: 14,
          }}
        >
          About this project
        </Link>

        {user ? (
          <>
            <Link
              href="/chat"
              style={{
                textDecoration: "none",
                color: "#4b5563",
                fontSize: 14,
              }}
            >
              Chat
            </Link>
            <button
              onClick={logout}
              style={{
                background: "none",
                border: "none",
                color: "#4b5563",
                fontSize: 14,
                cursor: "pointer",
                padding: 0,
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              style={{
                textDecoration: "none",
                color: "#4b5563",
                fontSize: 14,
              }}
            >
              Login
            </Link>
            <Link
              href="/signup"
              style={{
                textDecoration: "none",
                color: "#4b5563",
                fontSize: 14,
              }}
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
