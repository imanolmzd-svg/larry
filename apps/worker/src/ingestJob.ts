// apps/worker/src/ingestJob.ts
import { prisma } from "@larry/db";
import { DocumentIngestionAttemptStatus, DocumentStatus } from "@larry/db/src/generated/prisma/enums.js";
import { downloadToBuffer } from "./lib/s3.js";
import { extractPdfTextWithPageMap } from "./lib/pdf.js";
import { chunkTextByTokens } from "./lib/chunking.js";
import { embedMany } from "./lib/embeddings.js";
import { publishDocumentStatus } from "./lib/redisProgress.js";
import { CHUNK_TARGET_TOKENS, CHUNK_OVERLAP_TOKENS } from "./config/constants.js";
import { debug, info, error } from "./lib/logger.js";


type Params = {
  documentId: string;
  attemptId: string;
};

export async function ingestJob({ documentId, attemptId }: Params): Promise<void> {
  info("[ingestJob]", "Starting ingestion job", { documentId, attemptId });
  
  // 1) Load document + attempt
  debug("[ingestJob]", "Loading document and attempt from DB");
  
  const [doc, attempt] = await Promise.all([
    prisma.document.findUnique({
      where: { id: documentId },
      select: { id: true, userId: true, storageKey: true, mimeType: true, filename: true },
    }),
    prisma.documentIngestionAttempt.findUnique({
      where: { id: attemptId },
      select: { id: true, documentId: true, status: true },
    }),
  ]);

  if (!doc) {
    error("[ingestJob]", "Document not found", { documentId });
    throw new Error(`Document not found: ${documentId}`);
  }
  if (!attempt) {
    error("[ingestJob]", "Attempt not found", { attemptId });
    throw new Error(`Attempt not found: ${attemptId}`);
  }
  if (attempt.documentId !== documentId) {
    error("[ingestJob]", "Attempt/document mismatch", {
      attemptDocId: attempt.documentId,
      expectedDocId: documentId,
    });
    throw new Error(`Attempt does not belong to document`);
  }

  debug("[ingestJob]", "Document and attempt loaded", {
    filename: doc.filename,
    mimeType: doc.mimeType,
    storageKey: doc.storageKey,
    attemptStatus: attempt.status,
  });

  // Idempotency: terminal states are no-ops
  if (attempt.status === DocumentIngestionAttemptStatus.READY) {
    info("[ingestJob]", "Attempt already READY, skipping");
    return;
  }
  if (attempt.status === DocumentIngestionAttemptStatus.FAILED) {
    info("[ingestJob]", "Attempt already FAILED, skipping");
    return;
  }

  // For MVP: require PROCESSING here (main.ts claimed it)
  if (attempt.status !== DocumentIngestionAttemptStatus.PROCESSING) {
    error("[ingestJob]", "Unexpected attempt status", { status: attempt.status });
    throw new Error(`Attempt status must be PROCESSING, got ${attempt.status}`);
  }

  // PDF-only guard
  const mime = (doc.mimeType ?? "").toLowerCase();
  const name = (doc.filename ?? "").toLowerCase();
  const isPdf = mime === "application/pdf" || name.endsWith(".pdf");
  
  debug("[ingestJob]", "Checking file type", { mime, name, isPdf });
  
  if (!isPdf) {
    error("[ingestJob]", "Unsupported file type", { mimeType: doc.mimeType, filename: doc.filename });
    throw new Error(`Unsupported file type (PDF only). mimeType=${doc.mimeType} filename=${doc.filename}`);
  }

  info("[ingestJob]", "Starting PDF processing", { filename: doc.filename });

  // 2) Download from S3
  debug("[ingestJob]", "Downloading file from S3", { storageKey: doc.storageKey });
  const pdfBuffer = await downloadToBuffer(doc.storageKey);
  info("[ingestJob]", "File downloaded from S3", { sizeKB: Math.round(pdfBuffer.length / 1024) });

  // 3) Parse PDF to text + page map (for citations)
  debug("[ingestJob]", "Extracting text from PDF");
  const { fullText, pageSpans } = await extractPdfTextWithPageMap(pdfBuffer);
  info("[ingestJob]", "PDF text extracted", {
    pages: pageSpans.length,
    chars: fullText.length,
  });

  if (fullText.length === 0) {
    error("[ingestJob]", "PDF contains no extractable text");
    throw new Error("PDF contains no extractable text");
  }

  // 4) Chunk
  debug("[ingestJob]", "Chunking text", {
    targetTokens: CHUNK_TARGET_TOKENS,
    overlapTokens: CHUNK_OVERLAP_TOKENS,
  });
  
  const chunks = chunkTextByTokens(fullText, {
    targetTokens: CHUNK_TARGET_TOKENS,
    overlapTokens: CHUNK_OVERLAP_TOKENS,
  }).map((c, idx) => {
    const pages = pagesForSpan(pageSpans, c.startChar, c.endChar);
    return {
      chunkIndex: idx,
      content: c.text,
      metadata: { pages },
    };
  });
  
  info("[ingestJob]", "Text chunked", { chunkCount: chunks.length });

  // 5) Embeddings
  debug("[ingestJob]", "Generating embeddings for chunks");
  const vectors = await embedMany(chunks.map((c) => c.content));
  info("[ingestJob]", "Embeddings generated", { vectorCount: vectors.length });

  if (vectors.length !== chunks.length) {
    error("[ingestJob]", "Embedding count mismatch", {
      vectors: vectors.length,
      chunks: chunks.length,
    });
    throw new Error(`Embedding count mismatch: vectors=${vectors.length} chunks=${chunks.length}`);
  }

  // 6) Persist (transaction)
  debug("[ingestJob]", "Starting DB transaction to persist chunks");
  
  await prisma.$transaction(async (tx) => {
    // Clean partial chunks for this attempt (retry-safe)
    debug("[ingestJob]", "Cleaning old chunks for retry safety");
    const deleted = await tx.documentChunk.deleteMany({ where: { attemptId } });
    debug("[ingestJob]", "Old chunks deleted", { count: deleted.count });

    // Insert chunks
    debug("[ingestJob]", "Inserting chunks into DB");
    
    for (let i = 0; i < chunks.length; i++) {
      debug("[ingestJob]", `Creating chunk ${i + 1}/${chunks.length}`);
      
      const row = await tx.documentChunk.create({
        data: {
          documentId,
          attemptId,
          chunkIndex: chunks[i]!.chunkIndex,
          content: chunks[i]!.content,
          metadata: chunks[i]!.metadata,
          // embedding is nullable, set via raw SQL below
        },
        select: { id: true },
      });

      // Store embedding vector via raw query
      debug("[ingestJob]", `Updating embedding for chunk ${i + 1}/${chunks.length}`, {
        chunkId: row.id,
      });
      
      const vecLiteral = `[${vectors[i]!.join(",")}]`;
      await tx.$executeRawUnsafe(
        `UPDATE "DocumentChunk" SET "embedding" = $1::vector WHERE "id" = $2`,
        vecLiteral,
        row.id
      );
    }

    debug("[ingestJob]", "Updating attempt status to READY");
    
    await tx.documentIngestionAttempt.update({
      where: { id: attemptId },
      data: {
        status: DocumentIngestionAttemptStatus.READY,
        progress: 100,
        finishedAt: new Date(),
        errorCode: null,
        errorMessage: null,
      },
    });

    debug("[ingestJob]", "Updating document status to READY");
    
    await tx.document.update({
      where: { id: documentId },
      data: {
        status: DocumentStatus.READY,
      },
    });
  });
  
  info("[ingestJob]", "Chunks persisted to DB", { chunkCount: chunks.length });

  // Publish READY status to Redis for real-time updates
  debug("[ingestJob]", "Publishing READY status to Redis");
  await publishDocumentStatus(doc.userId, documentId, "READY", attemptId);
  
  info("[ingestJob]", "Ingestion job complete", { documentId, attemptId });
}

type PageSpan = { pageNumber: number; startChar: number; endChar: number };

// Given pageSpans and a [start,end) char span, return pages included.
function pagesForSpan(pageSpans: PageSpan[], startChar: number, endChar: number): number[] {
  const pages: number[] = [];
  for (const p of pageSpans) {
    const overlaps = Math.max(startChar, p.startChar) < Math.min(endChar, p.endChar);
    if (overlaps) pages.push(p.pageNumber);
  }
  // De-dup + stable
  return Array.from(new Set(pages)).sort((a, b) => a - b);
}
