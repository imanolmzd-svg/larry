import type { RetrievedChunk } from "../../infra/db/chunkRepository.js";

export function buildRagPrompt(
  chunks: RetrievedChunk[],
  question: string
): Array<{ role: "system" | "user"; content: string }> {
  const systemMessage = `You answer ONLY using the provided context below.
If the answer is not explicitly in the context, say you don't know.
Do not hallucinate or make up information.
Answer concisely and directly.`;

  const contextBlocks = chunks.map(chunk => {
    const pageInfo = chunk.pages.length > 0 ? ` page=${chunk.pages.join(",")}` : "";
    return `[CHUNK chunkId=${chunk.id} documentId=${chunk.documentId}${pageInfo}]
${chunk.content}
[/CHUNK]`;
  }).join("\n\n");

  const userMessage = `Context:
${contextBlocks}

Question: ${question}`;

  return [
    { role: "system", content: systemMessage },
    { role: "user", content: userMessage },
  ];
}
