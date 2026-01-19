import { z } from "zod";

export const DocumentStatusEnum = z.enum([
  "CREATED",
  "UPLOADED",
  "PROCESSING",
  "READY",
  "FAILED",
]);

export type DocumentStatusType = z.infer<typeof DocumentStatusEnum>;

export const DocumentStatusEventSchema = z.object({
  type: z.literal("document.status.changed"),
  documentId: z.string(),
  userId: z.string(),
  status: DocumentStatusEnum,
  attemptId: z.string().optional(),
  ts: z.string(),
});

export type DocumentStatusEvent = z.infer<typeof DocumentStatusEventSchema>;

export function createDocumentStatusEvent(
  documentId: string,
  userId: string,
  status: DocumentStatusType,
  attemptId?: string
): DocumentStatusEvent {
  return {
    type: "document.status.changed",
    documentId,
    userId,
    status,
    attemptId,
    ts: new Date().toISOString(),
  };
}

export function validateDocumentStatusEvent(
  data: unknown
): DocumentStatusEvent | null {
  const result = DocumentStatusEventSchema.safeParse(data);
  return result.success ? result.data : null;
}

export function getRedisChannel(userId: string): string {
  return `larry:user:${userId}:document-status`;
}
