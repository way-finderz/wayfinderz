FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY scripts ./scripts/
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
# Install all dependencies for build stage
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
# Cache bust: 2024-01-26 - Fixed esbuild configuration
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY . .
# Build shared package first, then API with esbuild
RUN pnpm --filter shared build && pnpm --filter api build

FROM base AS prod-deps
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY scripts ./scripts/
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
# Install only runtime production dependencies
ENV NODE_ENV=production
RUN pnpm install --frozen-lockfile --prod

FROM base AS runner
WORKDIR /app/apps/api
ENV NODE_ENV=production
# Copy bundled dist files
COPY --from=builder /app/apps/api/dist ./dist
# Copy production node_modules (both root for pnpm store and app-specific)
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=prod-deps /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./package.json
EXPOSE 3000
CMD ["node", "dist/index.js"]
