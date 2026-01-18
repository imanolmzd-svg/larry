import type { RetrievedChunk } from "../../infra/db/chunkRepository.js";
import type { ChatSource } from "./types.js";

export function mapChunksToSources(chunks: RetrievedChunk[]): ChatSource[] {
  // Track how many sources we've seen per document (max 1 per document)
  const documentCounts = new Map<string, number>();

  return chunks
    .filter(chunk => {
      const count = documentCounts.get(chunk.documentId) ?? 0;
      if (count >= 1) {
        return false; // Skip this chunk, already have 1 source from this document
      }
      documentCounts.set(chunk.documentId, count + 1);
      return true;
    })
    .map(chunk => {
      // Take first 15 words instead of 15 characters
      const words = chunk.content.split(/\s+/);
      const firstWords = words.slice(0, 15).join(" ");
      const snippet = firstWords + (words.length > 15 ? "..." : "");

      return {
        documentId: chunk.documentId,
        documentName: chunk.documentName ?? undefined,
        chunkId: chunk.id,
        page: chunk.pages[0], // First page if multiple
        snippet,
      };
    });
}
