.PHONY: dev db redis down reset

dev:
	docker compose up -d
	pnpm dev

db:
	docker compose up -d postgres

redis:
	docker compose up -d redis

down:
	docker compose down

reset:
	docker compose down -v
