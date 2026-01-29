"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/shared/auth";
import { DocumentUpload } from "@/ui/documents/DocumentUpload";
import { ChatWindow } from "@/ui/chat/ChatWindow";
import { getUserLimits, AuthError } from "@/shared/api";
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
        .catch((err) => {
          if (err instanceof AuthError) {
            router.push("/login");
            return;
          }
          console.error("Failed to fetch limits:", err);
        });
    }
  }, [user, router]);

  if (isLoading) {
    return <div style={{ padding: "40px 16px", textAlign: "center" }}>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const refreshLimits = () => {
    getUserLimits()
      .then(setLimits)
      .catch((err) => {
        if (err instanceof AuthError) {
          router.push("/login");
          return;
        }
        console.error("Failed to refresh limits:", err);
      });
  };

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1 style={{
        fontSize: 22,
        fontWeight: 700,
        marginBottom: 16,
        color: "var(--color-text-primary)",
        display: "flex",
        alignItems: "center",
        gap: 12
      }}>
        Ask Larry
        {limits && (
          <span style={{
            fontSize: 18,
            fontWeight: 600,
            color: limits.questions.remaining <= 0
              ? "var(--error-text)"
              : limits.questions.remaining <= 2
                ? "var(--warning-text)"
                : "var(--success-text)"
          }}>
            {limits.questions.used}/{limits.questions.limit}
          </span>
        )}
      </h1>
      <ChatWindow limits={limits} onQuestionAsked={refreshLimits} />

      <div style={{ marginTop: 40 }}>
        <h1 style={{
          fontSize: 22,
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
              fontSize: 18,
              fontWeight: 600,
              color: limits.documents.remaining <= 0
                ? "var(--error-text)"
                : limits.documents.remaining <= 2
                  ? "var(--warning-text)"
                  : "var(--success-text)"
            }}>
              (max 10)
            </span>
          )}
        </h1>

        <DocumentUpload onUploadSuccess={refreshLimits} />
      </div>
    </main>
  );
}
