"use client";

import { useState } from "react";
import type { ChatMessage } from "@/shared/types";
import { askQuestion } from "@/shared/api";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";

export function ChatWindow() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
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
        <ChatInput onSend={handleSend} disabled={loading} />
      </div>
    </div>
  );
}
