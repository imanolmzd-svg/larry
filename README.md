# Larry

Ask questions to your documents.
Always with sources. Or no answer.

## Demo


https://github.com/user-attachments/assets/92827607-3d9f-4d06-bf5b-466596ed47e1

---

## Overview

Larry processes PDF documents and answers questions based on their content, always providing sources or explicitly stating when no answer can be found.

**Architecture:**
- **Web**: Next.js application for document upload and chat interface
- **API**: Node.js REST API handling authentication, document management, and RAG-powered question answering
- **Worker**: Node.js service consuming SQS messages to process documents asynchronously (parsing, chunking, embedding generation)

**Infrastructure:**
- **PostgreSQL** (+ pgvector) - Data storage and vector similarity search
- **Redis** - Caching and real-time progress updates
- **MinIO/S3** - File storage for uploaded PDFs
- **LocalStack / AWS SQS** - Message queue for async document processing
- **OpenAI API** - Text embeddings and chat completions

---

## Documentation

- **[Quick Start](docs/QUICK_START.md)** - Get Larry running locally in 5 minutes
- **[System Workflows](docs/architecture/workflows.md)** - Diagrams of main flows
- **[API Reference](docs/api/README.md)** - Available endpoints
- **[Roadmap](docs/ROADMAP.md)** - Next steps and future plans
- **[Contributing](docs/CONTRIBUTING.md)** - How to contribute
- **Technical Specs** - See `/docs` directory for product and technical documentation
