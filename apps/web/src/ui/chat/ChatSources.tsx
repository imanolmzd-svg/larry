import type { ChatSource } from "@/shared/types";

type ChatSourcesProps = {
  sources: ChatSource[];
};

export function ChatSources({ sources }: ChatSourcesProps) {
  if (sources.length === 0) return null;

  // Limit to max 1 source total as defensive measure
  const limitedSources = sources.slice(0, 1);

  return (
    <div
      style={{
        marginTop: 8,
        padding: 12,
        background: "var(--surface-alt)",
        borderRadius: 8,
        border: "1px solid var(--card-border)",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "var(--color-text-secondary)",
          marginBottom: 8,
        }}
      >
        Source
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {limitedSources.map((source, idx) => (
          <div key={idx} style={{ fontSize: 13 }}>
            <div style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>
              {source.documentName || source.documentId}
              {source.page && (
                <span style={{ color: "var(--color-text-secondary)", fontWeight: 400 }}>
                  {" "}
                  · Page {source.page}
                </span>
              )}
            </div>
            {source.snippet && (
              <div
                style={{
                  marginTop: 4,
                  color: "var(--color-text-secondary)",
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
