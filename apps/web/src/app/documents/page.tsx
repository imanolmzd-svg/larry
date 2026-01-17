"use client";

import React, { useRef, useState } from "react";
import { UploadCard } from "@/ui/documents/UploadCard";


type UploadItem = {
  id: string;
  fileName: string;
  sizeBytes: number;
  status: "idle" | "uploading" | "success" | "error";
  error?: string;
};

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  const kb = n / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

export default function DocumentsPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [items, setItems] = useState<UploadItem[]>([]);

  const onPickClick = () => inputRef.current?.click();

  const onFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const id = crypto.randomUUID();
    setItems((prev) => [
      {
        id,
        fileName: file.name,
        sizeBytes: file.size,
        status: "idle",
      },
      ...prev,
    ]);

    // permite volver a seleccionar el mismo archivo
    e.target.value = "";
  };

  const remove = (id: string) =>
    setItems((prev) => prev.filter((x) => x.id !== id));

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>
        Documents
      </h1>

      <UploadCard onPick={onPickClick} />

      <input
        ref={inputRef}
        type="file"
        onChange={onFilePicked}
        style={{ display: "none" }}
        accept=".pdf,.txt,.csv,.xlsx,.xls"
      />

      <section>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
          Recent uploads
        </h2>

        {items.length === 0 ? (
          <div style={{ color: "#6b7280", fontSize: 14 }}>
            You haven&apos;t uploaded any files yet.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {items.map((it) => (
              <div
                key={it.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {it.fileName}
                  </div>
                  <div style={{ fontSize: 13, color: "#6b7280" }}>
                    {formatBytes(it.sizeBytes)} · {it.status}
                  </div>
                </div>

                <button
                  onClick={() => remove(it.id)}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 10,
                    border: "1px solid #e5e7eb",
                    background: "black",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
