import { openai, EMBEDDING_MODEL } from "./client.js";

export async function generateEmbedding(text: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });

  if (!res.data[0]) {
    throw new Error("No embedding returned from OpenAI");
  }

  return res.data[0].embedding;
}
