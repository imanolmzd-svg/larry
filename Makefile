.PHONY: dev infra db redis minio down reset logs migrate prisma-validate install generate setup sqs sqs-create

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

sqs:
	docker compose up -d localstack

sqs-create: sqs
	docker compose exec localstack awslocal sqs create-queue --queue-name larry-ingest || true

down:
	docker compose down

reset:
	docker compose down -v

logs:
	docker compose logs -f

prisma-validate:
	pnpm prisma validate

migrate:
	pnpm prisma migrate dev

install:
	pnpm install

generate:
	pnpm prisma generate

checks:
	pnpm -r lint
	pnpm -r typecheck

setup: infra install generate prisma-validate migrate sqs-create
