export type ChatSource = {
  documentId: string;
  documentName?: string;
  chunkId: string;
  page?: number;
  snippet: string;
};

export type ChatResponse = {
  answer: string;
  sources: ChatSource[];
};
