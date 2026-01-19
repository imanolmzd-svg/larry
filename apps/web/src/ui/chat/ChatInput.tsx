import { useState, KeyboardEvent } from "react";

type ChatInputProps = {
  onSend: (text: string) => void;
  disabled?: boolean;
};

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;

    onSend(trimmed);
    setInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        padding: 16,
        border: "1px solid var(--card-border)",
        borderRadius: 12,
        background: "var(--card-bg)",
      }}
    >
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask something about your documents..."
        disabled={disabled}
        style={{
          flex: 1,
          border: "none",
          outline: "none",
          resize: "none",
          fontFamily: "inherit",
          fontSize: 14,
          minHeight: 40,
          padding: 8,
          color: "var(--color-text-primary)",
          background: "var(--card-bg)",
        }}
        rows={1}
      />
      <button
        onClick={handleSend}
        disabled={disabled || !input.trim()}
        style={{
          padding: "10px 16px",
          borderRadius: 8,
          border: "none",
          background: disabled || !input.trim() ? "var(--button-disabled)" : "var(--button-primary)",
          color: "white",
          cursor: disabled || !input.trim() ? "not-allowed" : "pointer",
          fontWeight: 600,
          fontSize: 14,
        }}
      >
        Send
      </button>
    </div>
  );
}
