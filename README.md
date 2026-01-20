# Larry

Ask questions to your documents.
Always with sources. Or no answer.

## Demo


https://github.com/user-attachments/assets/92827607-3d9f-4d06-bf5b-466596ed47e1

---

## Documentation

- **[System Workflows](docs/architecture/workflows.md)** - Detailed diagrams of document upload, worker processing, and chat/query flows
- **Product & Technical Docs** - See `/docs` directory for additional documentation


## Environment variables
Copy `apps/api/.env.example` to `apps/api/.env` and fill values.

Required: DATABASE_URL, REDIS_URL, S3_ENDPOINT, S3_KEY, S3_SECRET, S3_BUCKET



# Postgres setup
The init scripts in /docker-entrypoint-initdb.d run only on first database initialization.
If you already have a local Postgres volume, reset it once:

```bash
docker compose down -v
docker compose up -d
