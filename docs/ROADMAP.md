# Roadmap

## Current Status

Larry MVP is feature-complete with:
- PDF document upload and processing
- Vector-based semantic search (pgvector)
- RAG-powered chat with source citations
- Real-time status updates via Redis/WebSockets
- User limits and authentication

## Next Steps

### Testing & Quality
- Add unit tests for core domain logic (API + worker)
- Add CI coverage reporting
- Finalize error handling and retries in ingestion worker

### Observability
- Improve structured logs with correlation IDs
- Add performance metrics and dashboards
- Enhanced error tracking and alerting

### Security & Reliability
- Harden authentication mechanisms
- Review and strengthen user limits
- Add rate limiting for API endpoints
- Implement proper secret rotation

### User Experience
- Polish frontend loading states
- Improve empty state messaging
- Better error state handling
- Progressive enhancement for slow connections

### Operations
- Add production-ready deployment checks
- Implement health check endpoints
- Database migration strategy
- Backup and disaster recovery plan

### Developer Experience
- Write contribution guidelines
- Improve local development setup
- Add architecture decision records (ADRs)
- API documentation with OpenAPI/Swagger

## Non-Goals (Current Phase)

- Mobile applications
- OCR for scanned documents
- Multi-user collaboration
- External integrations
- Public API
