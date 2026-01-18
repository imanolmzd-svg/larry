"use client";

import React, { useRef, useState, useEffect } from "react";
import { UploadCard } from "./UploadCard";
import { apiPost, getDocuments } from "@/shared/api";
import type { DocumentListItem } from "@/shared/types";

type UploadItem = {
  id: string;
  fileName: string;
  sizeBytes: number;
  status: "idle" | "uploading" | "success" | "error";
  error?: string;
};

type InitRes = {
  documentId: string;
  uploadUrl: string;
};

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  const kb = n / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

export function DocumentUpload() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [items, setItems] = useState<UploadItem[]>([]);
  const [documents, setDocuments] = useState<DocumentListItem[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);

  // Fetch documents on mount
  useEffect(() => {
    getDocuments()
      .then(setDocuments)
      .catch((err) => {
        console.error("Failed to fetch documents:", err);
      })
      .finally(() => {
        setIsLoadingDocs(false);
      });
  }, []);

  const onPickClick = () => inputRef.current?.click();

  const onFilePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Allows choosing the same file
    e.target.value = "";

    // Check for duplicate filename
    const isDuplicate = documents.some((doc) => doc.filename === file.name);
    if (isDuplicate) {
      alert("A file with this name already exists. Please rename the file and try again.");
      return;
    }

    const id = crypto.randomUUID();

    // 1) UI
    setItems((prev) => [
      {
        id,
        fileName: file.name,
        sizeBytes: file.size,
        status: "uploading",
      },
      ...prev,
    ]);

    try {
      // 2) INIT
      const init = await apiPost<InitRes>("/documents/init", {
        filename: file.name,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: file.size,
      });

      // 3) PUT to S3/MinIO
      const putRes = await fetch(init.uploadUrl, {
        method: "PUT",
        body: file,
      });

      if (!putRes.ok) {
        console.error("upload failed", putRes);
        const text = await putRes.text().catch(() => "");
        throw new Error(text || `upload failed (HTTP ${putRes.status})`);
      }

      // 4) COMPLETE
      await apiPost("/documents/complete", { documentId: init.documentId });

      // 5) UI: success
      setItems((prev) =>
        prev.map((x) => (x.id === id ? { ...x, status: "success" } : x))
      );

      // 6) Refresh document list
      getDocuments()
        .then(setDocuments)
        .catch((err) => console.error("Failed to refresh documents:", err));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";

      setItems((prev) =>
        prev.map((x) =>
          x.id === id ? { ...x, status: "error", error: message } : x
        )
      );
    }
  };

  const remove = (id: string) =>
    setItems((prev) => prev.filter((x) => x.id !== id));

  return (
    <div>
      <UploadCard onPick={onPickClick} />

      <input
        ref={inputRef}
        type="file"
        onChange={onFilePicked}
        style={{ display: "none" }}
        accept=".pdf,.txt,.csv,.xlsx,.xls"
      />

      {items.length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
            Recent uploads
          </h2>

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
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {it.fileName}
                  </div>
                  <div style={{ fontSize: 13, color: "#6b7280" }}>
                    {formatBytes(it.sizeBytes)} · {it.status}
                  </div>
                  {it.status === "error" && it.error && (
                    <div style={{ fontSize: 13, color: "#b91c1c", marginTop: 4 }}>
                      {it.error}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => remove(it.id)}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 10,
                    border: "1px solid #e5e7eb",
                    background: "black",
                    color: "white",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
          Your documents
        </h2>

        {isLoadingDocs ? (
          <div style={{ color: "#6b7280", fontSize: 14 }}>Loading...</div>
        ) : documents.length === 0 ? (
          <div style={{ color: "#6b7280", fontSize: 14 }}>
            You haven&apos;t uploaded any files yet.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {documents.map((doc) => (
              <div
                key={doc.id}
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
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {doc.filename}
                  </div>
                  <div style={{ fontSize: 13, color: "#6b7280" }}>
                    {doc.size ? formatBytes(doc.size) : "Unknown size"} · {doc.status}
                  </div>
                  <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                    {new Date(doc.createdAt).toLocaleDateString()} {new Date(doc.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
