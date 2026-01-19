"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/shared/auth";
import { DocumentUpload } from "@/ui/documents/DocumentUpload";
import { ChatWindow } from "@/ui/chat/ChatWindow";

export default function ChatPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div style={{ padding: "40px 16px", textAlign: "center" }}>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16, color: "var(--color-text-primary)" }}>
        Documents
      </h1>

      <DocumentUpload />

      <div style={{ marginTop: 40 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: "var(--color-text-primary)" }}>
          Ask Larry
        </h2>
        <ChatWindow />
      </div>
    </main>
  );
}
