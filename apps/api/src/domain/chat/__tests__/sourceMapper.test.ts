import { describe, expect, it } from "vitest";
import { mapChunksToSources } from "../sourceMapper.js";
import type { RetrievedChunk } from "../ports.js";

describe("mapChunksToSources", () => {
  const makeChunk = (overrides: Partial<RetrievedChunk> = {}): RetrievedChunk => ({
    id: "chunk-1",
    documentId: "doc-1",
    documentName: "Test Document.pdf",
    content: "This is the chunk content with many words to test the snippet truncation feature.",
    pages: [1],
    similarity: 0.95,
    ...overrides,
  });

  it("returns empty array for empty chunks", () => {
    const result = mapChunksToSources([]);
    expect(result).toEqual([]);
  });

  it("returns only 1 source (most relevant)", () => {
    const chunks = [
      makeChunk({ id: "c1", similarity: 0.95 }),
      makeChunk({ id: "c2", similarity: 0.90 }),
      makeChunk({ id: "c3", similarity: 0.85 }),
    ];
    const result = mapChunksToSources(chunks);

    expect(result).toHaveLength(1);
    expect(result[0]?.chunkId).toBe("c1");
  });

  it("maps chunk fields to source fields", () => {
    const chunk = makeChunk({
      id: "chunk-123",
      documentId: "doc-456",
      documentName: "My Document.pdf",
      pages: [5],
    });
    const result = mapChunksToSources([chunk]);

    expect(result[0]).toMatchObject({
      documentId: "doc-456",
      documentName: "My Document.pdf",
      chunkId: "chunk-123",
      page: 5,
    });
  });

  it("creates snippet from first 15 words", () => {
    const chunk = makeChunk({
      content: "one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen",
    });
    const result = mapChunksToSources([chunk]);

    expect(result[0]?.snippet).toBe(
      "one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen..."
    );
  });

  it("does not add ellipsis for short content", () => {
    const chunk = makeChunk({
      content: "short content here",
    });
    const result = mapChunksToSources([chunk]);

    expect(result[0]?.snippet).toBe("short content here");
    expect(result[0]?.snippet).not.toContain("...");
  });

  it("handles null documentName", () => {
    const chunk = makeChunk({ documentName: null });
    const result = mapChunksToSources([chunk]);

    expect(result[0]?.documentName).toBeUndefined();
  });

  it("uses first page when multiple pages", () => {
    const chunk = makeChunk({ pages: [3, 4, 5] });
    const result = mapChunksToSources([chunk]);

    expect(result[0]?.page).toBe(3);
  });

  it("handles empty pages array", () => {
    const chunk = makeChunk({ pages: [] });
    const result = mapChunksToSources([chunk]);

    expect(result[0]?.page).toBeUndefined();
  });
});
