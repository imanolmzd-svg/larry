import Link from "next/link";

export default function SignupPage() {
  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Sign up</h1>

      <div
        style={{
          padding: 16,
          background: "#fef3c7",
          border: "1px solid #fbbf24",
          borderRadius: 8,
        }}
      >
        <p style={{ fontSize: 14, color: "#92400e", lineHeight: 1.6 }}>
          In the current version, user signups are limited.{" "}
          <Link
            href="/about"
            style={{
              color: "#92400e",
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
