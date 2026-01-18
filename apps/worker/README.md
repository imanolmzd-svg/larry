# Worker – Document Ingestion

This service processes document ingestion jobs asynchronously.
It consumes messages from SQS and executes the full ingestion pipeline, from raw file retrieval to searchable vector chunks.

The worker is the **single orchestrator** responsible for turning an uploaded document into a ready-to-query resource.

---

## Responsibilities

- Poll an SQS queue using long polling
- Consume ingestion messages `{ documentId, attemptId }`
- Load and update ingestion state in Postgres
- Download the source file from S3 / MinIO
- Parse and normalize document content (PDF, DOCX, TXT, CSV, XLSX, etc.)
- Split content into semantic chunks
- Generate embeddings using OpenAI
- Persist chunks and vectors in Postgres (pgvector)
- Emit ingestion progress updates via Redis
- Handle retries, failures, and idempotency

---

## Ingestion Pipeline

1. **Receive SQS Message**
   Message body:
   ```json
   {
     "documentId": "string",
     "attemptId": "string"
   }
   ```

2. **State Transition (Postgres)**

   * Validate attempt and document
   * `DocumentIngestionAttempt`: `INITIATED → PROCESSING`
   * `Document.status → PROCESSING`
   * All changes happen inside a transaction

3. **Download from S3**

   * Fetch the file using `Document.storageKey`
   * Stream or store temporarily on disk

4. **Parse & Normalize**

   * Extract text based on file type
   * Preserve citation metadata (pages, sheets, ranges)
   * Normalize output into a single logical document

5. **Chunking**

   * Split text into ~800-token chunks with overlap
   * Assign deterministic `chunkIndex`
   * Attach citation metadata to each chunk

6. **Embeddings**

   * Batch chunks
   * Generate embeddings via OpenAI
   * Map vectors back to chunk indices

7. **Persistence (Postgres)**

   * Insert `DocumentChunk` rows (content + metadata + vector)
   * Remove chunks from previous attempts if applicable
   * Update counters and timestamps

8. **Progress Updates (Redis)**

   * Publish ingestion progress events
   * Update percentage / stage for UI consumption

9. **Completion**

   * `DocumentIngestionAttempt → READY`
   * `Document.status → READY`
   * Acknowledge SQS message

10. **Failure Handling**

    * Mark attempt and document as `FAILED`
    * Store `errorCode` and `errorMessage`
    * Let SQS retry or send to DLQ

---

## Ingestion State Machine

### `DocumentIngestionAttempt.status`

```
INITIATED → PROCESSING → READY
                    ↘
                     FAILED
```

### `Document.status`

```
CREATED / UPLOADED → PROCESSING → READY
                                ↘
                                 FAILED
```

Postgres is the source of truth for ingestion state.

---

## Idempotency & Reliability

* SQS provides **at-least-once delivery**
* The worker is fully idempotent:

  * Terminal attempts (`READY`, `FAILED`) are no-ops
* SQS messages are acknowledged only after successful DB commits
* Failures are persisted before retry
* Previous chunks are replaced atomically on successful re-ingestion

---

## Environment Variables

```bash
DATABASE_URL=postgresql://...
SQS_QUEUE_URL=https://sqs...
AWS_REGION=us-east-1

# S3 / MinIO
S3_BUCKET=larry-documents
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_ENDPOINT_URL=http://localhost:4566  # optional (LocalStack)

# OpenAI
OPENAI_API_KEY=...

# Redis
REDIS_URL=redis://localhost:6379
```

---

## Running the Worker

```bash
pnpm install
pnpm build
pnpm start
```

The worker runs continuously and processes ingestion jobs as they arrive.

---

## Design Notes

* SQS is used for delivery, not coordination
* Postgres defines the ingestion lifecycle
* Redis is used only for ephemeral progress and UI feedback
* Chunks are versioned by ingestion attempt
* The worker favors correctness and observability over parallelism for MVP

