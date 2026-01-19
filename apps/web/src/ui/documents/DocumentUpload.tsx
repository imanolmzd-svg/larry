"use client";

import React, { useRef, useState, useEffect } from "react";
import { UploadCard } from "./UploadCard";
import { apiPost, getDocuments, deleteDocument, getUserLimits } from "@/shared/api";
import type { DocumentListItem, UserLimits } from "@/shared/types";

type InitRes = {
  documentId: string;
  uploadUrl: string;
};

type DocumentUploadProps = {
  onUploadSuccess?: () => void;
};

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  const kb = n / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

export function DocumentUpload({ onUploadSuccess }: DocumentUploadProps = {}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [documents, setDocuments] = useState<DocumentListItem[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
  const [limits, setLimits] = useState<UserLimits | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch documents and limits on mount
  useEffect(() => {
    Promise.all([getDocuments(), getUserLimits()])
      .then(([docs, lims]) => {
        setDocuments(docs);
        setLimits(lims);
      })
      .catch((err) => {
        console.error("Failed to fetch data:", err);
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

    // Check limit
    if (limits && limits.documents.remaining <= 0) {
      alert("Document limit reached. You have uploaded 10/10 documents.");
      return;
    }

    // Check for duplicate filename
    const isDuplicate = documents.some((doc) => doc.filename === file.name);
    if (isDuplicate) {
      alert("A file with this name already exists. Please rename the file and try again.");
      return;
    }

    setIsUploading(true);

    try {
      // 1) INIT
      const init = await apiPost<InitRes>("/documents/init", {
        filename: file.name,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: file.size,
      });

      // 2) PUT to S3/MinIO
      const putRes = await fetch(init.uploadUrl, {
        method: "PUT",
        body: file,
      });

      if (!putRes.ok) {
        console.error("upload failed", putRes);
        const text = await putRes.text().catch(() => "");
        throw new Error(text || `upload failed (HTTP ${putRes.status})`);
      }

      // 3) COMPLETE
      await apiPost("/documents/complete", { documentId: init.documentId });

      // 4) Refresh document list and limits
      Promise.all([getDocuments(), getUserLimits()])
        .then(([docs, lims]) => {
          setDocuments(docs);
          setLimits(lims);
          onUploadSuccess?.();
        })
        .catch((err) => console.error("Failed to refresh data:", err));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      alert(`Upload failed: ${message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (docId: string, filename: string) => {
    if (!confirm(`Are you sure you want to delete "${filename}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingDocId(docId);
    try {
      await deleteDocument(docId);
      // Refresh document list (note: counter does not decrement)
      const updatedDocs = await getDocuments();
      setDocuments(updatedDocs);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      alert(`Failed to delete document: ${message}`);
    } finally {
      setDeletingDocId(null);
    }
  };

  const isAtLimit = limits && limits.documents.remaining <= 0;
  const isNearLimit = limits && limits.documents.remaining > 0 && limits.documents.remaining <= 2;

  return (
    <div>
      <UploadCard onPick={onPickClick} disabled={isAtLimit || isUploading} />

      <input
        ref={inputRef}
        type="file"
        onChange={onFilePicked}
        style={{ display: "none" }}
        accept=".pdf,.txt,.csv,.xlsx,.xls"
      />

      {isUploading && (
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            background: "var(--info-bg)",
            border: "1px solid var(--info-border)",
            borderRadius: 8,
            fontSize: 14,
            color: "var(--info-text)",
          }}
        >
          Uploading document...
        </div>
      )}

      <section>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: "var(--color-text-primary)" }}>
          Your documents
        </h2>

        {isLoadingDocs ? (
          <div style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>Loading...</div>
        ) : documents.length === 0 ? (
          <div style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>
            You haven&apos;t uploaded any files yet.
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: 12,
            padding: 16,
            border: "1px solid var(--card-border)",
            borderRadius: 12,
            background: "var(--card-bg)",
            minHeight: 120
          }}>
            {documents.map((doc) => {
              const capitalizeStatus = (status: string) => {
                return status.charAt(0) + status.slice(1).toLowerCase();
              };

              return (
                <div
                  key={doc.id}
                  style={{
                    position: "relative",
                    border: "2px solid var(--card-border)",
                    borderRadius: 8,
                    padding: 12,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    opacity: deletingDocId === doc.id ? 0.5 : 1,
                    background: "var(--card-bg)",
                    minHeight: 110,
                    textAlign: "center"
                  }}
                >
                  <button
                    onClick={() => handleDeleteDocument(doc.id, doc.filename)}
                    disabled={deletingDocId === doc.id}
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      width: 20,
                      height: 20,
                      borderRadius: 4,
                      border: "1px solid var(--card-border)",
                      background: "var(--card-bg)",
                      color: "var(--color-warm-gray)",
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: deletingDocId === doc.id ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                    }}
                    title="Delete document"
                  >
                    ×
                  </button>

                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 12,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      width: "100%",
                      color: "var(--color-text-primary)",
                      marginTop: 8,
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                    title={doc.filename}
                  >
                    {doc.filename}
                  </div>

                  {doc.status === 'READY' && (
                    <div style={{
                      fontSize: 12,
                      fontWeight: 400,
                      color: "white",
                      background: "#16a34a",
                      padding: "4px 12px",
                      borderRadius: 6,
                      marginTop: "auto"
                    }}>
                      {capitalizeStatus(doc.status)}
                    </div>
                  )}
                  {doc.status === 'PROCESSING' && (
                    <div style={{
                      fontSize: 12,
                      fontWeight: 400,
                      color: "white",
                      background: "var(--color-warm-gray)",
                      padding: "4px 12px",
                      borderRadius: 6,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginTop: "auto"
                    }}>
                      {capitalizeStatus(doc.status)}
                      <span style={{
                        fontSize: 14,
                        animation: "spin 1s linear infinite",
                        display: "inline-block"
                      }}>
                        ⟳
                      </span>
                    </div>
                  )}
                  {doc.status === 'FAILED' && (
                    <div style={{
                      fontSize: 12,
                      fontWeight: 400,
                      color: "white",
                      background: "#dc2626",
                      padding: "4px 12px",
                      borderRadius: 6,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginTop: "auto"
                    }}>
                      {capitalizeStatus(doc.status)} <span style={{ fontSize: 14 }}>!</span>
                    </div>
                  )}
                  {(doc.status === 'CREATED' || doc.status === 'UPLOADED') && (
                    <div style={{
                      fontSize: 12,
                      fontWeight: 400,
                      color: "white",
                      background: "var(--color-warm-gray)",
                      padding: "4px 12px",
                      borderRadius: 6,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginTop: "auto"
                    }}>
                      {capitalizeStatus(doc.status)} <span style={{ fontSize: 14 }}>○</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
