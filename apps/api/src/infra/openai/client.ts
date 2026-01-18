import OpenAI from "openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error("Missing env var: OPENAI_API_KEY");
}

export const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
export const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDINGS_MODEL ?? "text-embedding-3-small";
export const CHAT_MODEL = process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini";
