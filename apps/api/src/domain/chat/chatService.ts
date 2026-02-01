import { buildRagPrompt } from "./promptBuilder.js";
import { mapChunksToSources } from "./sourceMapper.js";
import type { ChatResponse } from "./types.js";
import type { ChatCompletionProvider, ChunkRetriever, EmbeddingProvider } from "./ports.js";
import { MAX_QUESTION_LENGTH, DEFAULT_CHUNK_RETRIEVAL_LIMIT } from "../../config/constants.js";

const NO_ANSWER_RESPONSE = "I couldn't find this information in your documents.";

function isNoKnowledgeResponse(answer: string): boolean {
  const lowerAnswer = answer.toLowerCase();

  // Common phrases indicating lack of knowledge
  const noKnowledgePhrases = [
    "don't know",
    "do not know",
    "i don't know",
    "i do not know",
    "cannot find",
    "can't find",
    "couldn't find",
    "could not find",
    "no information",
    "not found",
    "unable to find",
    "no answer",
    "cannot answer",
    "can't answer"
  ];

  return noKnowledgePhrases.some(phrase => lowerAnswer.includes(phrase));
}

export type ChatDependencies = {
  generateEmbedding: EmbeddingProvider;
  createChatCompletion: ChatCompletionProvider;
  findSimilarChunks: ChunkRetriever;
};

export async function askQuestion(
  question: string,
  userId: string,
  deps: ChatDependencies
): Promise<ChatResponse> {
  // Validate
  if (!question || question.trim().length === 0) {
    throw new Error("Question cannot be empty");
  }

  if (question.length > MAX_QUESTION_LENGTH) {
    throw new Error(`Question too long (max ${MAX_QUESTION_LENGTH} chars)`);
  }

  // 1. Generate embedding
  const startEmbed = Date.now();
  const embedding = await deps.generateEmbedding(question);
  const embedTime = Date.now() - startEmbed;

  // 2. Retrieve chunks
  const startRetrieval = Date.now();
  const chunks = await deps.findSimilarChunks(embedding, userId, DEFAULT_CHUNK_RETRIEVAL_LIMIT);
  const retrievalTime = Date.now() - startRetrieval;

  console.log(`[chat] Retrieved ${chunks.length} chunks in ${retrievalTime}ms (embed: ${embedTime}ms)`);

  // 3. Handle no chunks
  if (chunks.length === 0) {
    return {
      answer: NO_ANSWER_RESPONSE,
      sources: [],
    };
  }

  // 4. Build prompt
  const messages = buildRagPrompt(chunks, question);

  // 5. Call OpenAI
  const startLLM = Date.now();
  const answer = await deps.createChatCompletion(messages);
  const llmTime = Date.now() - startLLM;

  console.log(`[chat] Generated answer in ${llmTime}ms`);

  // 6. Check if answer indicates lack of knowledge
  const indicatesNoKnowledge = isNoKnowledgeResponse(answer);

  // 7. Map sources only if answer contains actual information
  const sources = indicatesNoKnowledge ? [] : mapChunksToSources(chunks);

  return { answer, sources };
}
