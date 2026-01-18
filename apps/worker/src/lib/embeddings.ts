import OpenAI from "openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error("Missing env var: OPENAI_API_KEY");
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const MODEL = process.env.OPENAI_EMBEDDINGS_MODEL ?? "text-embedding-3-small";

export async function embedMany(texts: string[]): Promise<number[][]> {
  // Batch size: keep it conservative for MVP
  const batchSize = 64;
  const out: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const res = await openai.embeddings.create({
      model: MODEL,
      input: batch,
    });

    // Preserve order
    for (const item of res.data) {
      out.push(item.embedding);
    }
  }

  return out;
}
