# syntax=docker/dockerfile:1.7

# ---------- base ----------
FROM node:22.12-alpine AS base
WORKDIR /app
# Flags para CI
ENV CI=true HUSKY=0 NODE_OPTIONS=--max-old-space-size=512
RUN npm install -g pnpm@10.18.3

# ---------- deps (instala TODAS as dependências, inclusive dev) ----------
FROM base AS deps
# Manifests do monorepo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
# Package manifests para melhor cache
COPY packages ./packages
COPY apps/api-gateway/package.json ./apps/api-gateway/
COPY apps/auth-service/package.json ./apps/auth-service/
COPY apps/tasks-service/package.json ./apps/tasks-service/
COPY apps/notifications-service/package.json ./apps/notifications-service/
COPY apps/web/package.json ./apps/web/

# Instala com devDependencies (necessário pro build do Nest)
RUN pnpm install --no-frozen-lockfile --prefer-offline --no-optional --prod=false

# ---------- development ----------
FROM deps AS development
COPY apps/auth-service ./apps/auth-service
WORKDIR /app/apps/auth-service
EXPOSE 3002
CMD ["pnpm","run","dev"]

# ---------- build ----------
FROM deps AS build
# Copia código completo
COPY packages ./packages
COPY apps ./apps

# 1) Build dos tipos (sem turbo)
RUN pnpm --filter @taskmanagerjungle/types run build \
  || pnpm exec tsc -p packages/types/tsconfig.json

# 2) Build do Auth Service
RUN pnpm --filter ./apps/auth-service run build

# ---------- runtime ----------
FROM node:22.12-alpine AS production
WORKDIR /app
ENV NODE_ENV=production NODE_PATH=/app/node_modules

# Copia dist e package.json do serviço
COPY --from=build /app/apps/auth-service/dist ./dist
COPY --from=build /app/apps/auth-service/package.json ./package.json

# Copia node_modules da raiz (workspace) e packages compartilhados
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages

EXPOSE 3002
CMD ["node", "dist/main.js"]
