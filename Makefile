.PHONY: dev infra db redis minio down reset logs

dev: infra
	pnpm dev

infra:
	docker compose up -d

db:
	docker compose up -d postgres

redis:
	docker compose up -d redis

minio:
	docker compose up -d minio

down:
	docker compose down

reset:
	docker compose down -v

logs:
	docker compose logs -f
