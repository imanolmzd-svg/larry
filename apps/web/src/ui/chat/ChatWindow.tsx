"use client";

import { useState } from "react";
import type { ChatMessage, UserLimits } from "@/shared/types";
import { askQuestion } from "@/shared/api";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";

type ChatWindowProps = {
  limits: UserLimits | null;
  onQuestionAsked?: () => void;
};

export function ChatWindow({ limits, onQuestionAsked }: ChatWindowProps) {
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

      // Refresh limits after successful question
      onQuestionAsked?.();
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _isNearLimit = limits ? limits.questions.remaining > 0 && limits.questions.remaining <= 2 : false;

  return (
    <div>
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
        <div style={{ padding: 16 }}>
          <ChatInput onSend={handleSend} disabled={loading || isAtLimit} />
        </div>
      </div>
    </div>
  );
}
