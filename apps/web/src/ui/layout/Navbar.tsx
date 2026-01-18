"use client";

import Link from "next/link";

export function Navbar() {
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

      <div style={{ display: "flex", gap: 24 }}>
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
      </div>
    </nav>
  );
}
