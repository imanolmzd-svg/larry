"use client";

type UploadCardProps = {
  onPick: () => void;
  disabled?: boolean;
};

export function UploadCard({ onPick, disabled = false }: UploadCardProps) {
  return (
    <div
      style={{
        border: "1px solid var(--card-border)",
        borderRadius: 12,
        padding: 16,
        display: "flex",
        gap: 12,
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
        background: "var(--card-bg)",
      }}
    >
      <div>
        <div style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>Upload file</div>
        <div style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>
          PDF, TXT, CSV, Excel…
        </div>
      </div>

      <button
        onClick={onPick}
        disabled={disabled}
        style={{
          padding: "10px 12px",
          borderRadius: 10,
          border: "none",
          background: disabled ? "var(--button-disabled)" : "var(--button-primary)",
          color: "white",
          cursor: disabled ? "not-allowed" : "pointer",
          fontWeight: 600,
          opacity: disabled ? 0.6 : 1,
        }}
      >
        Choose file
      </button>
    </div>
  );
}
