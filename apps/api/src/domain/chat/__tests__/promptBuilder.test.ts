import { describe, expect, it } from "vitest";
import { buildRagPrompt } from "../promptBuilder.js";
import type { RetrievedChunk } from "../ports.js";

describe("buildRagPrompt", () => {
  const makeChunk = (overrides: Partial<RetrievedChunk> = {}): RetrievedChunk => ({
    id: "chunk-1",
    documentId: "doc-1",
    documentName: "Test Document.pdf",
    content: "This is the chunk content.",
    pages: [1],
    similarity: 0.95,
    ...overrides,
  });

  it("returns system and user messages", () => {
    const chunks = [makeChunk()];
    const question = "What is the content?";

    const result = buildRagPrompt(chunks, question);

    expect(result).toHaveLength(2);
    expect(result[0]?.role).toBe("system");
    expect(result[1]?.role).toBe("user");
  });

  it("system message instructs to use only context", () => {
    const chunks = [makeChunk()];
    const result = buildRagPrompt(chunks, "test question");

    expect(result[0]?.content).toContain("ONLY using the provided context");
    expect(result[0]?.content).toContain("don't know");
  });

  it("includes chunk content in user message", () => {
    const chunks = [makeChunk({ content: "Important information here" })];
    const result = buildRagPrompt(chunks, "What is important?");

    expect(result[1]?.content).toContain("Important information here");
  });

  it("includes chunk metadata (id, documentId, pages)", () => {
    const chunks = [makeChunk({ id: "c123", documentId: "d456", pages: [2, 3] })];
    const result = buildRagPrompt(chunks, "test");

    expect(result[1]?.content).toContain("chunkId=c123");
    expect(result[1]?.content).toContain("documentId=d456");
    expect(result[1]?.content).toContain("page=2,3");
  });

  it("handles chunks with no pages", () => {
    const chunks = [makeChunk({ pages: [] })];
    const result = buildRagPrompt(chunks, "test");

    // Should not include page= when no pages
    expect(result[1]?.content).not.toContain("page=");
  });

  it("handles multiple chunks", () => {
    const chunks = [
      makeChunk({ id: "c1", content: "First chunk" }),
      makeChunk({ id: "c2", content: "Second chunk" }),
      makeChunk({ id: "c3", content: "Third chunk" }),
    ];
    const result = buildRagPrompt(chunks, "test");

    expect(result[1]?.content).toContain("First chunk");
    expect(result[1]?.content).toContain("Second chunk");
    expect(result[1]?.content).toContain("Third chunk");
    expect(result[1]?.content).toContain("[CHUNK chunkId=c1");
    expect(result[1]?.content).toContain("[CHUNK chunkId=c2");
    expect(result[1]?.content).toContain("[CHUNK chunkId=c3");
  });

  it("includes the question in user message", () => {
    const chunks = [makeChunk()];
    const question = "What is the meaning of life?";
    const result = buildRagPrompt(chunks, question);

    expect(result[1]?.content).toContain(`Question: ${question}`);
  });
});
