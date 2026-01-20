# Quick Start

## Prerequisites
- Node.js 20+
- pnpm
- Docker & Docker Compose
- OpenAI API key

## Local Development

1. Clone and install:
   ```bash
   git clone <repo>
   cd larry
   pnpm install
   ```

2. Start infrastructure:
   ```bash
   docker compose up -d
   ```

3. Set environment variables:
   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/worker/.env.example apps/worker/.env
   # Edit .env files with your values
   ```

4. Run migrations:
   ```bash
   pnpm --filter @larry/db generate
   npx prisma migrate dev
   ```

5. Start services:
   ```bash
   pnpm --filter @larry/api dev     # Terminal 1
   pnpm --filter @larry/worker dev  # Terminal 2
   pnpm --filter @larry/web dev     # Terminal 3
   ```

6. Open http://localhost:3000

## Common Issues

- **Port conflicts:** Check ports 3000, 4000, 5432, 6379, 9324 are free
- **Prisma errors:** Run `pnpm --filter @larry/db generate`
- **Missing env vars:** Check `apps/*/.env.example` files
