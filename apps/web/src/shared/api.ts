import type { ChatAskResponse } from "./types";

export async function apiPost<TRes>(
  path: string,
  body: unknown
): Promise<TRes> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  return (await res.json()) as TRes;
}

export async function askQuestion(question: string): Promise<ChatAskResponse> {
  return apiPost<ChatAskResponse>("/chat/ask", { question });
}
