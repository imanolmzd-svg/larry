import type { ChatAskResponse, DocumentListItem, UserLimits } from "./types";
import { ENV } from "@/config/env";
import { getAuthToken } from "@/shared/authStorage";

export class AuthError extends Error {
  constructor(message = "UNAUTHORIZED") {
    super(message);
    this.name = "AuthError";
  }
}

async function throwForResponse(res: Response): Promise<never> {
  if (res.status === 401) {
    throw new AuthError();
  }
  const text = await res.text().catch(() => "");
  throw new Error(text || `HTTP ${res.status}`);
}

export async function apiGet<TRes>(path: string): Promise<TRes> {
  const token = getAuthToken();

  const headers: Record<string, string> = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${ENV.API_URL}${path}`, {
    method: "GET",
    headers,
  });

  if (!res.ok) {
    await throwForResponse(res);
  }

  return (await res.json()) as TRes;
}

export async function apiPost<TRes>(
  path: string,
  body: unknown
): Promise<TRes> {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${ENV.API_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    await throwForResponse(res);
  }

  return (await res.json()) as TRes;
}

export async function askQuestion(question: string): Promise<ChatAskResponse> {
  return apiPost<ChatAskResponse>("/chat/ask", { question });
}

export async function getDocuments(): Promise<DocumentListItem[]> {
  return apiGet<DocumentListItem[]>("/documents");
}

export async function deleteDocument(documentId: string): Promise<void> {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${ENV.API_URL}/documents`, {
    method: "DELETE",
    headers,
    body: JSON.stringify({ documentId }),
  });

  if (!res.ok) {
    await throwForResponse(res);
  }
}

export async function getUserLimits(): Promise<UserLimits> {
  return apiGet<UserLimits>("/user/limits");
}
