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
            background: isAtLimit ? "#fef2f2" : isNearLimit ? "#fef3c7" : "#f0fdf4",
            border: `1px solid ${isAtLimit ? "#fecaca" : isNearLimit ? "#fde68a" : "#bbf7d0"}`,
            borderRadius: 8,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, color: isAtLimit ? "#b91c1c" : isNearLimit ? "#92400e" : "#166534" }}>
            Questions: {limits.questions.used}/{limits.questions.limit}
          </div>
          {isAtLimit && (
            <div style={{ fontSize: 13, color: "#b91c1c", marginTop: 4 }}>
              Limit reached. You cannot ask more questions.
            </div>
          )}
          {isNearLimit && (
            <div style={{ fontSize: 13, color: "#92400e", marginTop: 4 }}>
              You are approaching your question limit.
            </div>
          )}
        </div>
      )}
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {error && (
          <div
            style={{
              padding: 12,
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 8,
              margin: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ color: "#b91c1c", fontSize: 14 }}>{error}</span>
            <button
              onClick={handleRetry}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid #b91c1c",
                background: "white",
                color: "#b91c1c",
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
        <div style={{ padding: 16, borderTop: "1px solid #e5e7eb" }}>
          <ChatInput onSend={handleSend} disabled={loading || isAtLimit} />
        </div>
      </div>
    </div>
  );
}
