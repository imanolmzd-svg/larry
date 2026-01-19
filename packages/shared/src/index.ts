export const DocumentState = ["uploaded", "indexing", "ready", "failed"] as const;
export type DocumentState = (typeof DocumentState)[number];

// Document status events for real-time updates
export {
  DocumentStatusEnum,
  DocumentStatusEventSchema,
  createDocumentStatusEvent,
  validateDocumentStatusEvent,
  getRedisChannel,
} from "./events/documentStatus.js";
export type {
  DocumentStatusType,
  DocumentStatusEvent,
} from "./events/documentStatus.js";
