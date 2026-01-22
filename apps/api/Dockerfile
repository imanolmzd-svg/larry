FROM node:20-slim AS build
WORKDIR /repo

RUN corepack enable

# Manifests (cache)
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/worker/package.json apps/worker/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN pnpm install --frozen-lockfile

# Source
COPY tsconfig.base.json ./
COPY apps/api apps/api
COPY packages/db packages/db
COPY packages/shared packages/shared
COPY prisma prisma

# Build
RUN pnpm --filter @larry/shared build \
 && pnpm --filter @larry/db generate \
 && pnpm --filter @larry/db build \
 && pnpm -C apps/api build

# ---------- runtime ----------
FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production

RUN corepack enable

# Workspace skeleton so pnpm can resolve workspace deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/shared/package.json packages/shared/package.json

# Copy workspace packages so pnpm can link them
COPY packages/db packages/db
COPY packages/shared packages/shared

# Add these:
COPY --from=build /repo/packages/db/dist ./packages/db/dist
COPY --from=build /repo/packages/shared/dist ./packages/shared/dist
COPY prisma prisma

# Install production deps INTO apps/api (so express ends up in apps/api/node_modules)
RUN pnpm -C apps/api install --prod --frozen-lockfile

# Copy compiled output into apps/api/dist
COPY --from=build /repo/apps/api/dist ./apps/api/dist

WORKDIR /app/apps/api
EXPOSE 4000
CMD ["node", "dist/index.js"]
