import Link from "next/link";

export default function SignupPage() {
  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24, color: "var(--color-text-primary)" }}>Sign up</h1>

      <div
        style={{
          padding: 16,
          background: "var(--warning-bg)",
          border: "1px solid var(--warning-border)",
          borderRadius: 8,
        }}
      >
        <p style={{ fontSize: 14, color: "var(--warning-text)", lineHeight: 1.6 }}>
          In the current version, user signups are limited.{" "}
          <Link
            href="/about"
            style={{
              color: "var(--warning-text)",
              fontWeight: 600,
              textDecoration: "underline",
            }}
          >
            Learn more about this project
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
