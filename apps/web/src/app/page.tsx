"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/shared/auth";

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromNav = searchParams.get("from") === "nav";

  useEffect(() => {
    if (!isLoading && user && !fromNav) {
      router.push("/chat");
    }
  }, [user, isLoading, router, fromNav]);

  if (isLoading) {
    return <div style={{ padding: "80px 16px", textAlign: "center" }}>Loading...</div>;
  }

  return (
    <main style={{ maxWidth: 720, margin: "80px auto", padding: 16, textAlign: "center" }}>
      <img src="/larry-searching-2.png" alt="Larry" style={{ maxWidth: 300, margin: "0 auto 24px" }} />
      <h1 style={{ fontSize: 48, fontWeight: 700, color: "var(--color-text-primary)" }}>Larry</h1>
    </main>
  );
}
