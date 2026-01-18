import { openai, CHAT_MODEL } from "./client.js";

export async function createChatCompletion(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>
): Promise<string> {
  const res = await openai.chat.completions.create({
    model: CHAT_MODEL,
    messages,
    temperature: 0, // Strict mode
  });
  return res.choices[0]?.message?.content ?? "";
}
