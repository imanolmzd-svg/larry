# CLAUDE.md — Project Larry

This file defines how Claude Code should work on this repository.
It is authoritative.

---

## Project Overview

**Larry** is a B2C web product that allows individual professionals to ask
questions to their own documents and receive **strict, source-backed answers**.

Core principles:
- Document-only reasoning
- Strict mode is always enabled
- Every answer must include sources
- "No answer found" is a valid outcome

---

## Repository Structure

This is a monorepo **organized by services**, not by layers at root.

```
apps/
  web/        # Next.js web app (App Router)
  api/        # Express API (HTTP + streaming)
  worker/     # Async processing (indexing, embeddings)
packages/
  shared/     # Cross-service contracts only (types, events)
docs/         # Product and technical documentation
```

Each app under `apps/` is a **deployable service**.

`packages/shared` contains only cross-service contracts (types, events, schemas).
It must not contain domain logic.

---

## Service-Level Architecture

Each service contains its own layered architecture:

```
apps/{service}/src/
  domain/     # Entities, invariants, ports (interfaces)
  app/        # Use-cases, orchestration
  infra/      # Implementations (DB, queues, storage, external APIs)
```

Rules:
- `domain` must not depend on `infra`
- Infrastructure is injected via ports/adapters
- Event-driven design is preferred for async flows
- All async consumers must be idempotent

Database schemas and migrations live in:
```
apps/api/src/infra/db/prisma/
```

Do not introduce new services or infrastructure unless explicitly requested.

---

## MVP Constraints (Non-Negotiable)

- All questions search across **all documents of the user**
- Strict mode cannot be disabled
- Answers must be grounded in user documents only
- Citations are mandatory
- No OCR
- No document versioning
- Flat document list (no projects or tags)

If a requested change violates any of these, stop and ask.

---

## Development Setup

Primary commands:
- `make dev` → run full local stack
- `pnpm dev` → run web/api/worker
- `docker compose up -d` → local Postgres + Redis

Local development must not require AWS access.

---

## Testing and Quality

- Prefer simple, explicit code over abstractions
- Keep changes minimal and focused
- Do not introduce overengineering
- Tests and CI will be added incrementally

---

## Documentation Rules

- `/docs` are source of truth
- Do not modify docs unless explicitly requested
- Architectural or scope changes require a new decision document

---

## Commit Discipline

- Use small, intentional commits
- Prefix commits by type: `docs:`, `feat:`, `chore:`, `infra:`
- Never use vague messages like "initial commit"

---

## How to Work

When given a task:
1. Make the smallest correct change
2. Verify it runs locally
3. Report what was changed and why

If something is unclear, ask before proceeding.
