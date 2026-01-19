import OpenAI from "openai";
import { ENV } from "../../config/env.js";

export const openai = new OpenAI({ apiKey: ENV.OPENAI_API_KEY });
export const EMBEDDING_MODEL = ENV.OPENAI_EMBEDDINGS_MODEL;
export const CHAT_MODEL = ENV.OPENAI_CHAT_MODEL;
