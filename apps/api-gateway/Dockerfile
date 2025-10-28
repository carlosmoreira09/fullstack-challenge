# syntax=docker/dockerfile:1.7

# ---------- base ----------
FROM node:22.12-alpine AS base
WORKDIR /app
ENV CI=true HUSKY=0 NODE_ENV=production NODE_OPTIONS=--max-old-space-size=512
# use corepack (recomendado) ou pnpm global; deixei pnpm global como você já usava
RUN npm install -g pnpm@10.18.3

# ---------- deps (instala dependências do workspace com cache) ----------
FROM base AS deps
# Manifests do workspace (melhor cache)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
# Manifests dos pacotes/apps (apenas package.json para cache fino)
COPY packages ./packages
COPY apps/api-gateway/package.json ./apps/api-gateway/
COPY apps/auth-service/package.json ./apps/auth-service/
COPY apps/tasks-service/package.json ./apps/tasks-service/
COPY apps/notifications-service/package.json ./apps/notifications-service/
COPY apps/web/package.json ./apps/web/

# Instala dependências do monorepo (sem opcional, determinístico)
RUN pnpm install --frozen-lockfile --prefer-offline --no-optional

# ---------- build ----------
FROM deps AS build
# Agora precisamos do CÓDIGO completo para compilar tipos + gateway
COPY packages ./packages
COPY apps ./apps

# build ONLY the types package, no dependents
RUN pnpm -w --filter @taskmanagerjungle/types build


# 2) build do próprio gateway
RUN pnpm --filter ./apps/api-gateway build

# 3) preparar artefatos de runtime enxutos (node_modules só do gateway + dist)
#    pnpm deploy cria uma pasta pronta para produção
RUN pnpm -w --filter ./apps/api-gateway deploy --prod /out

# ---------- runtime ----------
FROM node:22.12-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

# Copia o bundle pronto do deploy (contém package.json, node_modules e dist do gateway)
COPY --from=build /out/ .

# Porta do API Gateway (alinha com seu compose)
EXPOSE 4000

CMD ["node", "dist/main.js"]