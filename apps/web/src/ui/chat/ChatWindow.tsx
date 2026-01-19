"use client";

import { useState, useEffect } from "react";
import type { ChatMessage, UserLimits } from "@/shared/types";
import { askQuestion, getUserLimits } from "@/shared/api";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";

export function ChatWindow() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limits, setLimits] = useState<UserLimits | null>(null);

  // Fetch limits on mount
  useEffect(() => {
    getUserLimits()
      .then(setLimits)
      .catch((err) => {
        console.error("Failed to fetch limits:", err);
      });
  }, []);

  const handleSend = async (text: string) => {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    try {
      const response = await askQuestion(text);

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: response.answer,
        sources: response.sources,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Refresh limits after successful question
      getUserLimits()
        .then(setLimits)
        .catch((err) => console.error("Failed to refresh limits:", err));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
  };

  const isAtLimit = limits ? limits.questions.remaining <= 0 : false;
  const isNearLimit = limits ? limits.questions.remaining > 0 && limits.questions.remaining <= 2 : false;

  return (
    <div>
      {limits && (
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            background: isAtLimit ? "var(--error-bg)" : isNearLimit ? "var(--warning-bg)" : "var(--success-bg)",
            border: `1px solid ${isAtLimit ? "var(--error-border)" : isNearLimit ? "var(--warning-border)" : "var(--success-border)"}`,
            borderRadius: 8,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, color: isAtLimit ? "var(--error-text)" : isNearLimit ? "var(--warning-text)" : "var(--success-text)" }}>
            Questions: {limits.questions.used}/{limits.questions.limit}
          </div>
          {isAtLimit && (
            <div style={{ fontSize: 13, color: "var(--error-text)", marginTop: 4 }}>
              Limit reached. You cannot ask more questions.
            </div>
          )}
          {isNearLimit && (
            <div style={{ fontSize: 13, color: "var(--warning-text)", marginTop: 4 }}>
              You are approaching your question limit.
            </div>
          )}
        </div>
      )}
      <div
        style={{
          border: "1px solid var(--card-border)",
          borderRadius: 12,
          overflow: "hidden",
          background: "var(--card-bg)",
        }}
      >
        {error && (
          <div
            style={{
              padding: 12,
              background: "var(--error-bg)",
              border: "1px solid var(--error-border)",
              borderRadius: 8,
              margin: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ color: "var(--error-text)", fontSize: 14 }}>{error}</span>
            <button
              onClick={handleRetry}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid var(--error-text)",
                background: "var(--card-bg)",
                color: "var(--error-text)",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Dismiss
            </button>
          </div>
        )}
        <MessageList messages={messages} loading={loading} />
        <div style={{ padding: 16, borderTop: "1px solid var(--card-border)" }}>
          <ChatInput onSend={handleSend} disabled={loading || isAtLimit} />
        </div>
      </div>
    </div>
  );
}
