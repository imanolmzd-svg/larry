import { prisma } from "@larry/db";

export type RetrievedChunk = {
  id: string;
  documentId: string;
  documentName: string | null;
  content: string;
  pages: number[];
  similarity: number;
};

export async function findSimilarChunks(
  embedding: number[],
  userId: string,
  limit: number = 5
): Promise<RetrievedChunk[]> {
  // Raw SQL query for pgvector cosine similarity
  const vectorStr = `[${embedding.join(",")}]`;

  const result = await prisma.$queryRawUnsafe<Array<{
    id: string;
    documentId: string;
    documentName: string | null;
    content: string;
    metadata: { pages?: number[] } | null;
    similarity: number;
  }>>(`
    SELECT
      c.id,
      c."documentId",
      d.filename as "documentName",
      c.content,
      c.metadata,
      1 - (c.embedding <=> $1::vector) as similarity
    FROM "DocumentChunk" c
    JOIN "Document" d ON c."documentId" = d.id
    WHERE d."userId" = $2
      AND c.embedding IS NOT NULL
    ORDER BY c.embedding <=> $1::vector
    LIMIT $3
  `, vectorStr, userId, limit);

  return result.map(r => ({
    id: r.id,
    documentId: r.documentId,
    documentName: r.documentName,
    content: r.content,
    pages: r.metadata?.pages ?? [],
    similarity: r.similarity,
  }));
}
