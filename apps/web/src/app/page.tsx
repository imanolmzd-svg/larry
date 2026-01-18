"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/shared/auth";

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/chat");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div style={{ padding: "80px 16px", textAlign: "center" }}>Loading...</div>;
  }

  return (
    <main style={{ maxWidth: 720, margin: "80px auto", padding: 16, textAlign: "center" }}>
      <h1 style={{ fontSize: 48, fontWeight: 700 }}>Larry</h1>
    </main>
  );
}
