import type { RetrievedChunk } from "../../infra/db/chunkRepository.js";
import type { ChatSource } from "./types.js";

export function mapChunksToSources(chunks: RetrievedChunk[]): ChatSource[] {
  // Limit to just 1 source total (the first/most relevant chunk)
  const limitedChunks = chunks.slice(0, 1);

  return limitedChunks.map(chunk => {
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
