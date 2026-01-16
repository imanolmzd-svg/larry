# Technical Stack — Larry

This document defines the **final, locked technical stack** for the Larry MVP.

All decisions here are intentional and aligned with the product principles:
**correctness, traceability, strictness, and operational robustness**.

---

## 1. Overview

Larry is built as a **web-only, event-driven system** with clear separation between:
- user-facing web application
- synchronous API
- asynchronous workers
- real-time feedback channels

The architecture prioritizes:
- reliability over cleverness
- debuggability over abstraction
- explicit contracts over implicit behavior

---

## 2. Frontend

**Technology**
- Next.js (App Router)
- TypeScript
- React Server Components by default
- Client Components only where required (uploads, chat, realtime)

**Responsibilities**
- Authentication flow
- Document upload
- Chat UI and history
- Real-time progress and logs
- Error and "no answer" states

**Hosting**
- Vercel

---

## 3. Backend API

**Technology**
- Node.js
- TypeScript
- REST API (`/v1`)
- Zod for input validation
- OpenAPI / Swagger documentation

**Responsibilities**
- Authenticated request handling
- Question answering (RAG)
- History persistence
- Rate limiting
- HTTP streaming for chat responses

---

## 4. Workers (Async Processing)

**Technology**
- Node.js + TypeScript
- Separate service (`apps/worker`)

**Responsibilities**
- Document parsing
- Chunking
- Embedding generation
- Vector indexing
- Emitting lifecycle events

Workers are fully decoupled from the API.

---

## 5. Data Storage

### PostgreSQL
- Source of truth for all metadata
- Prisma ORM
- Stores:
  - users
  - documents
  - chunks
  - conversations
  - messages
  - usage events

### Vector Store
- pgvector extension inside PostgreSQL
- One logical vector space per user (isolated by `userId`)

### Redis
- Rate limiting
- Idempotency locks
- Semantic cache
- Deduplication

### Object Storage
- Amazon S3
- Stores original uploaded files
- No direct public access

---

## 6. Async / Messaging

**Queue**
- AWS SQS (from day one)

**Event-driven design**
- Events represent domain facts (e.g. `DocumentUploaded`)
- Retries and DLQ enabled
- Consumers must be idempotent

SQS decouples ingestion, indexing, and user interaction.

---

## 7. Real-Time Communication

### WebSockets
**Technology**
- AWS API Gateway WebSocket API

**Used for**
- Document indexing progress
- Indexing logs
- Status changes (`uploaded → indexing → ready / failed`)
- Internal notifications

The backend publishes events; API Gateway manages connections.

### Chat Streaming
**Technology**
- HTTP streaming (fetch / chunked response)

**Used for**
- Streaming answer tokens
- Final answer delivery

This avoids stateful WebSocket chat handling while keeping the UX responsive.

---

## 8. Authentication

- Email + magic link
- No social login
- No anonymous users

Auth is required for all operations.

---

## 9. AI / RAG

**Provider**
- OpenAI API

**Capabilities**
- Embeddings for chunking and retrieval
- Chat completion for answers

**Rules**
- Document-only context
- Strict mode always enabled
- No external knowledge
- Explicit "no answer" when information is missing

Prompts are versioned and documented.

---

## 10. Observability

**Logging**
- Structured JSON logs
- Centralized in CloudWatch

**Errors**
- Sentry for API, worker, and web

**Metrics**
- Latency (ask p50 / p95)
- Indexing duration
- No-answer rate
- Queue depth
- Estimated AI cost

**Dashboards**
- Grafana Cloud

---

## 11. Deployment

**Web**
- Vercel

**API + Worker**
- AWS ECS (Fargate)

**Infrastructure**
- AWS (S3, RDS Postgres, SQS, Redis)

Secrets are managed per environment and never committed.

---

## 12. Non-Goals (Explicit)

- Mobile apps
- Email workflows
- OCR
- External connectors
- Public API
- Real-time collaboration

---

## 13. Invariant Principles

- All answers must be source-backed
- Strict mode is non-negotiable
- "No answer" is a first-class outcome
- All questions search across all user documents
- Realtime feedback is visible in the UI
- Product decisions are documented before implementation

---

This stack definition is **authoritative for the MVP**.
Any deviation requires an explicit decision document.
