import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/shared/types";
import { ChatSources } from "./ChatSources";

type MessageListProps = {
  messages: ChatMessage[];
  loading?: boolean;
};

export function MessageList({ messages, loading }: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (messages.length === 0 && !loading) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
          color: "#9ca3af",
          fontSize: 14,
        }}
      >
        Ask something about your documents.
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: 16,
        minHeight: 300,
        maxHeight: 500,
        overflowY: "auto",
      }}
    >
      {messages.map((msg) => (
        <div
          key={msg.id}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: msg.role === "user" ? "flex-end" : "flex-start",
          }}
        >
          <div
            style={{
              maxWidth: "80%",
              padding: 12,
              borderRadius: 12,
              background: msg.role === "user" ? "black" : "#f3f4f6",
              color: msg.role === "user" ? "white" : "#1f2937",
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            {msg.text}
          </div>
          {msg.role === "assistant" && msg.sources && (
            <div style={{ maxWidth: "80%", width: "100%" }}>
              <ChatSources sources={msg.sources} />
            </div>
          )}
        </div>
      ))}
      {loading && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              padding: 12,
              borderRadius: 12,
              background: "#f3f4f6",
              color: "#6b7280",
              fontSize: 14,
            }}
          >
            ...
          </div>
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
}
