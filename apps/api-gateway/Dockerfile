# syntax=docker/dockerfile:1.7

# ---------- base ----------
FROM node:22.12-alpine AS base
WORKDIR /app
# CI flags (no NODE_ENV here!)
ENV CI=true HUSKY=0 NODE_OPTIONS=--max-old-space-size=512
RUN npm install -g pnpm@10.18.3

# ---------- deps (install ALL deps, including dev) ----------
FROM base AS deps
# Workspace manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
# Package manifests for better caching
COPY packages ./packages
COPY apps/api-gateway/package.json ./apps/api-gateway/
COPY apps/auth-service/package.json ./apps/auth-service/
COPY apps/tasks-service/package.json ./apps/tasks-service/
COPY apps/notifications-service/package.json ./apps/notifications-service/
COPY apps/web/package.json ./apps/web/

# Install with dev deps (important: --prod=false)
RUN pnpm install --frozen-lockfile --prefer-offline --no-optional --prod=false

# ---------- build ----------
FROM deps AS build
# Now add full source
COPY packages ./packages
COPY apps ./apps

# 1) Build ONLY the types package (no -w at root to avoid turbo)
RUN pnpm --filter @taskmanagerjungle/types run build \
  || pnpm exec tsc -p packages/types/tsconfig.json

# 2) Build the API Gateway
RUN pnpm --filter ./apps/api-gateway run build

# 3) Produce slim runtime for the gateway only
RUN pnpm --filter api-gateway deploy --prod /out

# ---------- runtime ----------
FROM node:22.12-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
# Copy minimal runtime produced above
COPY --from=build /out/ .
EXPOSE 4000
CMD ["node", "dist/main.js"]