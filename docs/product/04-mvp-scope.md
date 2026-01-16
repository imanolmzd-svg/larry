# MVP Scope — Larry

This document defines the **non-negotiable scope** of the Larry MVP.
Anything not explicitly included here is **out of scope** for v1.

Larry is a **B2C product for individual professionals** who need reliable, source-backed answers from their own documents.
Correctness, traceability, and trust are prioritized over flexibility or creativity.

---

## 1. Core Product Definition

**Larry answers questions based exclusively on the user's documents.**
Every answer must be traceable to a source.
If the information is not present, Larry must explicitly say so.

- Strict mode is **always enabled**
- "No answer" is a valid and expected outcome
- Hallucinations are considered critical failures

---

## 2. Supported File Types (MVP)

Included:
- PDF (text-based, no OCR)
- Excel (`.xlsx`)
- CSV (`.csv`)

Excluded:
- OCR / scanned PDFs
- DOCX, TXT, Markdown
- Images, audio, video
- External data sources or connectors

---

## 3. Limits

- Max file size: **10 MB per file**
- Max documents per user: **10**
- Daily question limit: **fixed quota per user**
- Hard technical caps may exist beyond visible limits

---

## 4. Document Organization

- Flat list: **"My Documents"**
- No projects
- No folders
- No tags
- No document versioning

All questions always search **across all user documents**.

---

## 5. Document Lifecycle

Each document has a clear, visible state:

- `uploaded`
- `indexing`
- `ready`
- `failed`

During indexing:
- Progress and logs are streamed live to the UI
- Failures are explicit and actionable

---

## 6. Question & Answer Behavior

- Questions always search **all documents owned by the user**
- Retrieval is scoped strictly by `userId`
- Answers include:
  - Natural language response
  - Inline citations
  - A structured list of sources

If the answer cannot be found:
- Larry responds clearly that the information is not present
- No inference or extrapolation is allowed

---

## 7. Excel / Structured Data Behavior

Included:
- Reading existing values
- Referencing specific sheets, rows, columns, or ranges

Excluded:
- Aggregations (sum, avg, group by)
- Charts or visualizations
- Data mutation or transformation

---

## 8. History

- Persistent global history per user
- Includes:
  - Questions
  - Answers
  - Associated sources
- No per-project or per-document chat separation

---

## 9. Real-Time UX (WebSockets)

WebSockets are used for:
- Document indexing progress
- Indexing logs
- Streaming answer tokens
- Final answer delivery

All real-time updates happen **inside the web UI**.

No email notifications are sent.

---

## 10. Authentication

- Email + magic link only
- No social login
- No anonymous usage

---

## 11. Data Deletion

Included:
- Delete individual documents

Excluded (for MVP):
- Delete account
- Bulk delete
- Soft delete only

Deletion must remove:
- Metadata
- Binary files
- Derived data (chunks, embeddings)

---

## 12. Admin & Operations (Internal)

Minimal internal admin capabilities:
- View document indexing status
- Inspect errors
- Reprocess failed documents
- View basic system metrics

Metrics include:
- Question latency (p50 / p95)
- Indexing time
- No-answer rate
- Queue depth
- Estimated AI cost

Dashboards may be implemented via Grafana or cloud-native tooling.

---

## 13. Explicitly Out of Scope

The following are **not part of the MVP**:

- Email notifications or sending answers
- OCR
- Document versioning
- Projects, folders, or tags
- Strict mode toggle
- Per-question document selection
- Cross-user sharing
- Teams or collaboration
- Mobile apps
- Public API
- Fine-tuning or custom models

---

## 14. Product Principles (MVP)

- Correctness over completeness
- Traceability over fluency
- Explicit "I don't know" over guessing
- Simple UX over configurability
- Web-only interaction

---

**This scope is locked for MVP.**
Changes require an explicit versioned decision document.
