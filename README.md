# Larry

Ask questions to your documents.
Always with sources. Or no answer.

## Demo

https://github.com/user-attachments/assets/demo.mkv

> A video demonstration of Larry in action, showing document upload, processing, and intelligent question answering.

---

See /docs for product and technical documentation.


## Environment variables
Copy `apps/api/.env.example` to `apps/api/.env` and fill values.

Required: DATABASE_URL, REDIS_URL, S3_ENDPOINT, S3_KEY, S3_SECRET, S3_BUCKET



# Postgres setup
The init scripts in /docker-entrypoint-initdb.d run only on first database initialization.
If you already have a local Postgres volume, reset it once:

```bash
docker compose down -v
docker compose up -d
