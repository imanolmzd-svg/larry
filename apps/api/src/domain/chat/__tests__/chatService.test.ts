import { describe, expect, it, vi } from "vitest";
import { askQuestion, type ChatDependencies } from "../chatService.js";
import type { RetrievedChunk } from "../ports.js";

describe("askQuestion", () => {
  const makeChunk = (overrides: Partial<RetrievedChunk> = {}): RetrievedChunk => ({
    id: "chunk-1",
    documentId: "doc-1",
    documentName: "Test.pdf",
    content: "Test content for the chunk.",
    pages: [1],
    similarity: 0.95,
    ...overrides,
  });

  const makeDeps = (overrides: Partial<ChatDependencies> = {}): ChatDependencies => ({
    generateEmbedding: vi.fn().mockResolvedValue([0.1, 0.2, 0.3]),
    createChatCompletion: vi.fn().mockResolvedValue("This is the answer from the LLM."),
    findSimilarChunks: vi.fn().mockResolvedValue([makeChunk()]),
    ...overrides,
  });

  it("throws error for empty question", async () => {
    const deps = makeDeps();

    await expect(askQuestion("", "user-1", deps)).rejects.toThrow("Question cannot be empty");
    await expect(askQuestion("   ", "user-1", deps)).rejects.toThrow("Question cannot be empty");
  });

  it("throws error for question exceeding max length", async () => {
    const deps = makeDeps();
    const longQuestion = "a".repeat(2001);

    await expect(askQuestion(longQuestion, "user-1", deps)).rejects.toThrow("Question too long");
  });

  it("generates embedding for the question", async () => {
    const deps = makeDeps();
    await askQuestion("What is the answer?", "user-1", deps);

    expect(deps.generateEmbedding).toHaveBeenCalledWith("What is the answer?");
  });

  it("retrieves chunks using embedding and userId", async () => {
    const mockEmbedding = [0.1, 0.2, 0.3];
    const deps = makeDeps({
      generateEmbedding: vi.fn().mockResolvedValue(mockEmbedding),
    });

    await askQuestion("test question", "user-123", deps);

    expect(deps.findSimilarChunks).toHaveBeenCalledWith(mockEmbedding, "user-123", 5);
  });

  it("returns no-answer response when no chunks found", async () => {
    const deps = makeDeps({
      findSimilarChunks: vi.fn().mockResolvedValue([]),
    });

    const result = await askQuestion("test question", "user-1", deps);

    expect(result.answer).toBe("I couldn't find this information in your documents.");
    expect(result.sources).toEqual([]);
    expect(deps.createChatCompletion).not.toHaveBeenCalled();
  });

  it("calls LLM with prompt built from chunks", async () => {
    const deps = makeDeps();
    await askQuestion("What is in the document?", "user-1", deps);

    expect(deps.createChatCompletion).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ role: "system" }),
        expect.objectContaining({ role: "user" }),
      ])
    );
  });

  it("returns answer and sources when chunks found", async () => {
    const deps = makeDeps({
      findSimilarChunks: vi.fn().mockResolvedValue([
        makeChunk({ id: "c1", documentId: "d1", documentName: "Doc.pdf" }),
      ]),
      createChatCompletion: vi.fn().mockResolvedValue("The answer is 42."),
    });

    const result = await askQuestion("What is the answer?", "user-1", deps);

    expect(result.answer).toBe("The answer is 42.");
    expect(result.sources).toHaveLength(1);
    expect(result.sources[0]).toMatchObject({
      documentId: "d1",
      documentName: "Doc.pdf",
      chunkId: "c1",
    });
  });

  it("returns empty sources when LLM indicates no knowledge", async () => {
    const deps = makeDeps({
      createChatCompletion: vi.fn().mockResolvedValue("I don't know the answer to that question."),
    });

    const result = await askQuestion("test", "user-1", deps);

    expect(result.answer).toContain("I don't know");
    expect(result.sources).toEqual([]);
  });

  it("detects various no-knowledge phrases", async () => {
    const noKnowledgePhrases = [
      "I cannot find that information",
      "I couldn't find the answer",
      "There is no information about this",
      "I'm unable to find that",
      "I can't answer this question",
    ];

    for (const phrase of noKnowledgePhrases) {
      const deps = makeDeps({
        createChatCompletion: vi.fn().mockResolvedValue(phrase),
      });

      const result = await askQuestion("test", "user-1", deps);
      expect(result.sources).toEqual([]);
    }
  });

  it("includes sources when answer contains actual information", async () => {
    const deps = makeDeps({
      createChatCompletion: vi.fn().mockResolvedValue(
        "According to the document, the revenue was $1M in 2024."
      ),
    });

    const result = await askQuestion("What was the revenue?", "user-1", deps);

    expect(result.sources).toHaveLength(1);
  });
});
