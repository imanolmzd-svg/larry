export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  sources?: ChatSource[];
};

export type ChatSource = {
  documentId: string;
  documentName?: string;
  chunkId?: string;
  page?: number;
  snippet?: string;
};

export type ChatAskRequest = {
  question: string;
};

export type ChatAskResponse = {
  answer: string;
  sources?: ChatSource[];
};
