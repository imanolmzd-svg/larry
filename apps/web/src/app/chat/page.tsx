"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/shared/auth";
import { DocumentUpload } from "@/ui/documents/DocumentUpload";
import { ChatWindow } from "@/ui/chat/ChatWindow";
import { getUserLimits } from "@/shared/api";
import type { UserLimits } from "@/shared/types";

export default function ChatPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [limits, setLimits] = useState<UserLimits | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      getUserLimits()
        .then(setLimits)
        .catch((err) => console.error("Failed to fetch limits:", err));
    }
  }, [user]);

  if (isLoading) {
    return <div style={{ padding: "40px 16px", textAlign: "center" }}>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const refreshLimits = () => {
    getUserLimits()
      .then(setLimits)
      .catch((err) => console.error("Failed to refresh limits:", err));
  };

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1 style={{
        fontSize: 28,
        fontWeight: 700,
        marginBottom: 16,
        color: "var(--color-text-primary)",
        display: "flex",
        alignItems: "center",
        gap: 12
      }}>
        Documents
        {limits && (
          <span style={{
            fontSize: 20,
            fontWeight: 600,
            color: limits.documents.remaining <= 0
              ? "var(--error-text)"
              : limits.documents.remaining <= 2
                ? "var(--warning-text)"
                : "var(--success-text)"
          }}>
            {limits.documents.used}/{limits.documents.limit}
          </span>
        )}
      </h1>

      <DocumentUpload onUploadSuccess={refreshLimits} />

      <div style={{ marginTop: 40 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: "var(--color-text-primary)" }}>
          Ask Larry
        </h2>
        <ChatWindow />
      </div>
    </main>
  );
}
