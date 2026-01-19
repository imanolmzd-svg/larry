import { CHARS_PER_TOKEN } from "../config/constants.js";

type Chunk = { text: string; startChar: number; endChar: number };

export function chunkTextByTokens(
  text: string,
  opts: { targetTokens: number; overlapTokens: number }
): Chunk[] {
  // MVP token approximation: ~4 chars per token (rough, ok for chunk sizing)
  const charsPerToken = CHARS_PER_TOKEN;
  const targetChars = opts.targetTokens * charsPerToken;
  const overlapChars = opts.overlapTokens * charsPerToken;

  const chunks: Chunk[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(text.length, start + targetChars);
    const slice = text.slice(start, end).trim();

    if (slice.length > 0) {
      chunks.push({ text: slice, startChar: start, endChar: end });
    }

    if (end >= text.length) break;
    start = Math.max(0, end - overlapChars);
  }

  return chunks;
}
