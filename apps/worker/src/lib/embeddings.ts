import OpenAI from "openai";
import { EMBEDDING_BATCH_SIZE } from "../config/constants.js";
import { ENV } from "../config/env.js";

const openai = new OpenAI({ apiKey: ENV.OPENAI_API_KEY });
const MODEL = ENV.OPENAI_EMBEDDINGS_MODEL;

export async function embedMany(texts: string[]): Promise<number[][]> {
  const batchSize = EMBEDDING_BATCH_SIZE;
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
