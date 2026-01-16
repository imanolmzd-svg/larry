export const DocumentState = ["uploaded", "indexing", "ready", "failed"] as const;
export type DocumentState = (typeof DocumentState)[number];
