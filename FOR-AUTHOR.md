# FOR-AUTHOR — Larry

Welcome to Larry. Think of it as a personal research assistant that only trusts
the documents a user uploads. It does not "make things up" from the outside
world. Every answer must be grounded in the user's sources, and "no answer
found" is a valid, first-class outcome.

This guide explains the architecture, how the pieces fit together, why we made
the choices we did, and the kinds of pitfalls you'll want to avoid.

## The Big Idea (and Why It Matters)

Larry is a B2C product that lets individuals ask questions about their own
documents. The core contract is simple and strict:

- Document-only reasoning.
- Strict mode is always on.
- Every answer must include sources.

Imagine a librarian who never leaves the library and never answers unless they
can point to a specific page. That's Larry. The system is optimized to protect
that contract, even if it means returning "no answer found."

## Repo Structure (Service-Oriented Monorepo)

The repo is a monorepo organized by services, not by layers at the root.

```
apps/
  web/        # Next.js web app (App Router)
  api/        # Express API (HTTP + streaming)
  worker/     # Async processing (indexing, embeddings)
packages/
  shared/     # Cross-service contracts (types, events, schemas)
  db/         # Prisma client wrapper
docs/         # Product and technical documentation
```

Each `apps/*` entry is a deployable service. You can think of it like a small
team per service. They share contracts, but they ship independently.

## Service-Level Architecture (Domain/App/Infra)

Inside each service we use a clean layered structure:

```
apps/{service}/src/
  domain/  # Entities, invariants, ports (interfaces)
  app/     # Use-cases, orchestration
  infra/   # Implementations (DB, queues, external APIs)
```

This keeps business rules separate from infrastructure details. It helps avoid
the "everything depends on the database" trap and makes tests possible without
spinning up the world.

### Why this matters
If your `domain` needs to talk to a database, that's a smell. It should depend
on a port/interface, not a concrete database implementation.

## Data and Processing Flow (Narrative)

1. **User uploads documents** in the web app.
2. **API** handles the request and orchestrates ingestion.
3. **Worker** processes documents asynchronously (parsing, embeddings, etc.).
4. **User asks questions**; API queries and composes a response with citations.

This is a classic "front door + orchestrator + background processing" system,
like a restaurant:
- The web app is the front-of-house.
- The API is the chef taking orders and coordinating.
- The worker is the kitchen doing the heavy lifting.

## Technology Choices (and Why)

- **Next.js** for the web app: fast UX, server components, modern tooling.
- **Express** for API: streaming-friendly, well understood, easy to evolve.
- **Worker** service: isolates heavy async tasks and keeps the API responsive.
- **Prisma** in `packages/db`: centralized DB client shared by services.
- **Zod** in `packages/shared`: schema validation and shared types.

We prioritize **clarity and durability** over cleverness. This is not a code
golf project; it is a reliability project.

## Testing Philosophy (Minimal, High-Value)

We favor **small, high-leverage tests** that protect core behavior:

- **Domain/app logic** tests: stable, fast, high ROI.
- **Integration tests** for infra boundaries: a few, not many.
- **End-to-end tests** only for critical user flows.

Avoid "tests for tests' sake." If a test doesn't protect a user-facing behavior
or a tricky invariant, it is likely noise.

## Common Pitfalls (and How to Avoid Them)

1. **Breaking the document-only contract**
   - If a feature can answer without citations, it's a bug.
2. **Leaking infra into domain**
   - Domain should not import Prisma or AWS clients.
3. **Over-complicating async flows**
   - Async consumers must be idempotent. Assume retries will happen.
4. **Assuming "no answer found" is failure**
   - It's a valid outcome. Treat it as success.

## Lessons Learned (So You Don't Repeat Them)

- **Strict mode is a product promise, not a toggle.**
  It's not an optional feature; it's Larry's identity.
- **If the system can't cite, it shouldn't answer.**
  This is an intentional bias toward correctness.
- **Tests should be cheap and targeted.**
  A small set of good tests beats a large set of vague ones.

## How Good Engineers Think Here

We optimize for **clarity, traceability, and intentional decisions**:

- "Why does this exist?" should be answerable by reading the code.
- If a decision is architectural, document it (ADR).
- Be explicit; avoid magic.

If you keep the librarian metaphor in mind, you will make good choices.

## Quick Start Mental Model

If you're new, start with:
- `apps/web` to see the user experience.
- `apps/api` to see the orchestration and strict answer rules.
- `apps/worker` to see ingestion and embedding pipelines.
- `packages/shared` for cross-service contracts.

That is the full tour. Welcome aboard.
