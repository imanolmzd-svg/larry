// apps/worker/src/ingestJob.ts
import { prisma } from "@larry/db";
import { DocumentIngestionAttemptStatus, DocumentStatus } from "@larry/db/src/generated/prisma/enums.js";import { downloadToBuffer } from "./lib/s3.js";
import { extractPdfTextWithPageMap } from "./lib/pdf.js";
import { chunkTextByTokens } from "./lib/chunking.js";
import { embedMany } from "./lib/embeddings.js";
import { publishProgress } from "./lib/redisProgress.js";


type Params = {
  documentId: string;
  attemptId: string;
};

export async function ingestJob({ documentId, attemptId }: Params): Promise<void> {
  // 1) Load document + attempt
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

  if (!doc) throw new Error(`Document not found: ${documentId}`);
  if (!attempt) throw new Error(`Attempt not found: ${attemptId}`);
  if (attempt.documentId !== documentId) throw new Error(`Attempt does not belong to document`);

  // Idempotency: terminal states are no-ops
  if (attempt.status === DocumentIngestionAttemptStatus.READY) return;
  if (attempt.status === DocumentIngestionAttemptStatus.FAILED) return;

  // For MVP: require PROCESSING here (main.ts claimed it)
  if (attempt.status !== DocumentIngestionAttemptStatus.PROCESSING) {
    throw new Error(`Attempt status must be PROCESSING, got ${attempt.status}`);
  }

  // PDF-only guard
  const mime = (doc.mimeType ?? "").toLowerCase();
  const name = (doc.filename ?? "").toLowerCase();
  const isPdf = mime === "application/pdf" || name.endsWith(".pdf");
  if (!isPdf) {
    throw new Error(`Unsupported file type (PDF only). mimeType=${doc.mimeType} filename=${doc.filename}`);
  }

  console.log(`[ingest] Starting file=${doc.filename ?? "unknown"}`);
  await publishProgress(doc.userId, { documentId, attemptId, stage: "downloading", progress: 10 });

  // 2) Download from S3
  const pdfBuffer = await downloadToBuffer(doc.storageKey);
  console.log(`[ingest] Downloaded ${Math.round(pdfBuffer.length / 1024)}KB`);

  await publishProgress(doc.userId, { documentId, attemptId, stage: "parsing", progress: 25 });

  // 3) Parse PDF to text + page map (for citations)
  const { fullText, pageSpans } = await extractPdfTextWithPageMap(pdfBuffer);
  console.log(`[ingest] Parsed ${pageSpans.length} pages, ${fullText.length} chars`);

  if (fullText.length === 0) {
    throw new Error("PDF contains no extractable text");
  }

  await publishProgress(doc.userId, { documentId, attemptId, stage: "chunking", progress: 45 });

  // 4) Chunk
  const chunks = chunkTextByTokens(fullText, {
    targetTokens: 800,
    overlapTokens: 120,
  }).map((c, idx) => {
    const pages = pagesForSpan(pageSpans, c.startChar, c.endChar);
    return {
      chunkIndex: idx,
      content: c.text,
      metadata: { pages },
    };
  });
  console.log(`[ingest] Created ${chunks.length} chunks`);

  await publishProgress(doc.userId, { documentId, attemptId, stage: "embedding", progress: 65 });

  // 5) Embeddings
  const vectors = await embedMany(chunks.map((c) => c.content));
  console.log(`[ingest] Generated ${vectors.length} embeddings`);

  if (vectors.length !== chunks.length) {
    throw new Error(`Embedding count mismatch: vectors=${vectors.length} chunks=${chunks.length}`);
  }

  await publishProgress(doc.userId, { documentId, attemptId, stage: "persisting", progress: 85 });

  // 6) Persist (transaction)
  await prisma.$transaction(async (tx) => {
    // Clean partial chunks for this attempt (retry-safe)
    await tx.documentChunk.deleteMany({ where: { attemptId } });

    // Insert chunks
    // NOTE: for pgvector with Prisma Unsupported("vector"), you typically use raw SQL for the vector column.
    // We'll insert metadata/content via Prisma and then update embeddings via raw SQL in a loop or batched.
    // For MVP, do a simple loop (optimize later).
    for (let i = 0; i < chunks.length; i++) {
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

      // Store embedding vector via raw query. `vector` literal format: '[1,2,3]'::vector
      // Ensure your pgvector extension is installed and Prisma datasource configured (it is).
      const vecLiteral = `[${vectors[i]!.join(",")}]`;
      await tx.$executeRawUnsafe(
        `UPDATE "DocumentChunk" SET "embedding" = $1::vector WHERE "id" = $2`,
        vecLiteral,
        row.id
      );
    }

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

    await tx.document.update({
      where: { id: documentId },
      data: {
        status: DocumentStatus.READY,
      },
    });
  });
  console.log(`[ingest] Persisted ${chunks.length} chunks to DB`);

  await publishProgress(doc.userId, { documentId, attemptId, stage: "ready", progress: 100 });
  console.log(`[ingest] Complete doc=${documentId}`);
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
