export type RetrievedChunk = {
  id: string;
  documentId: string;
  documentName: string | null;
  content: string;
  pages: number[];
  similarity: number;
};

export type EmbeddingProvider = (input: string) => Promise<number[]>;

export type ChatCompletionProvider = (
  messages: Array<{ role: "system" | "user"; content: string }>
) => Promise<string>;

export type ChunkRetriever = (
  embedding: number[],
  userId: string,
  limit?: number
) => Promise<RetrievedChunk[]>;
