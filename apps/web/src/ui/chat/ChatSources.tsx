import type { ChatSource } from "@/shared/types";

type ChatSourcesProps = {
  sources: ChatSource[];
};

export function ChatSources({ sources }: ChatSourcesProps) {
  if (sources.length === 0) return null;

  return (
    <div
      style={{
        marginTop: 8,
        padding: 12,
        background: "#f9fafb",
        borderRadius: 8,
        border: "1px solid #e5e7eb",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#6b7280",
          marginBottom: 8,
        }}
      >
        Sources
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sources.map((source, idx) => (
          <div key={idx} style={{ fontSize: 13 }}>
            <div style={{ fontWeight: 600, color: "#374151" }}>
              {source.documentName || source.documentId}
              {source.page && (
                <span style={{ color: "#6b7280", fontWeight: 400 }}>
                  {" "}
                  · Page {source.page}
                </span>
              )}
            </div>
            {source.snippet && (
              <div
                style={{
                  marginTop: 4,
                  color: "#6b7280",
                  fontSize: 12,
                  fontStyle: "italic",
                }}
              >
                &quot;{source.snippet}&quot;
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
