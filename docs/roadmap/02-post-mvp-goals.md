# Post-MVP Goals

This section documents explicitly out-of-scope goals that are intentionally
not part of the MVP, but considered valuable for future quality and DX.

---

## Internal Dev Tool: PDF Sample Generator

**Status:** Out of MVP

Create an internal developer tool that generates synthetic PDF documents
based on:
- predefined themes
- controlled keywords
- explicit ground-truth content

### Purpose
- Validate RAG correctness
- Test citation accuracy
- Verify strict mode behavior
- Assert proper “no answer” responses

### Why this exists
This tool is not a product feature.
It exists to:
- enable reproducible QA
- support evals and benchmarks
- prevent regressions as Larry evolves

This tool must not influence product scope or user-facing behavior.
