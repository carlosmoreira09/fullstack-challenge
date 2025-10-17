# syntax=docker/dockerfile:1.7
FROM node:22.12-alpine AS base
WORKDIR /app
RUN npm install -g pnpm@10.18.3

# --- dependencies workspace ---
FROM base AS deps
# Copia manifestos do monorepo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
# Copia apenas manifests dos pacotes para resolver dependências corretamente
COPY packages ./packages
COPY apps/api-gateway/package.json ./apps/api-gateway/
COPY apps/auth-service/package.json ./apps/auth-service/
COPY apps/tasks-service/package.json ./apps/tasks-service/
COPY apps/notifications-service/package.json ./apps/notifications-service/
COPY apps/web/package.json ./apps/web/
# Instala deps de todo o workspace (eficiente com pnpm)
RUN pnpm install --frozen-lockfile

# --- development (hot-reload) ---
FROM deps AS development
# Copia o código da app
COPY apps/api-gateway ./apps/api-gateway
WORKDIR /app/apps/api-gateway
EXPOSE 3001
# O compose normalmente define o comando, mas deixamos um default:
CMD ["pnpm","run","dev"]

# --- build de produção ---
FROM deps AS build
COPY apps/api-gateway ./apps/api-gateway
WORKDIR /app/apps/api-gateway
RUN pnpm run build

# --- produção enxuta ---
FROM node:22.12-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
RUN npm install -g pnpm@10.18.3
# Copia apenas runtime
COPY --from=build /app/apps/api-gateway/dist ./dist
COPY apps/api-gateway/package.json ./
RUN pnpm install --prod --frozen-lockfile --ignore-scripts
EXPOSE 3001
CMD ["node","dist/main.js"]
