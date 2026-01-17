"use client";

type UploadCardProps = {
  onPick: () => void;
};

export function UploadCard({ onPick }: UploadCardProps) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 16,
        display: "flex",
        gap: 12,
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
      }}
    >
      <div>
        <div style={{ fontWeight: 600 }}>Upload file</div>
        <div style={{ fontSize: 14, color: "#6b7280" }}>
          PDF, TXT, CSV, Excel…
        </div>
      </div>

      <button
        onClick={onPick}
        style={{
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid #e5e7eb",
          background: "black",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        Choose file
      </button>
    </div>
  );
}
