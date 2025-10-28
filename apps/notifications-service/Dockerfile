# syntax=docker/dockerfile:1.7
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
COPY apps/notifications-service ./apps/notifications-service
WORKDIR /app/apps/notifications-service
EXPOSE 3004
CMD ["pnpm","run","dev"]

# ---------- build ----------
FROM deps AS build
# Copia código completo
COPY packages ./packages
COPY apps ./apps
RUN pnpm install -g pnpm@10.18.3

# 1) Build dos tipos (sem turbo)
RUN pnpm --filter @taskmanagerjungle/types run build \
  || pnpm exec tsc -p packages/types/tsconfig.json

# 2) Build do Notifications Service
RUN pnpm --filter ./apps/notifications-service run build

# ---------- runtime ----------
FROM node:22.12-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
RUN npm install -g pnpm@10.18.3

# Remove dependência dos types e instala apenas produção
RUN sed -i '/"@taskmanagerjungle\\/types"/d' apps/notifications-service/package.json \
  && pnpm install --prod --prefer-offline --no-optional --no-frozen-lockfile --filter ./apps/notifications-service...

# Reintroduz pacote de types gerado no build
RUN mkdir -p node_modules/@taskmanagerjungle/types
COPY --from=build /app/packages/types/package.json ./node_modules/@taskmanagerjungle/types/package.json
COPY --from=build /app/packages/types/dist ./node_modules/@taskmanagerjungle/types/dist

# Copia manifests do workspace para instalar dependências
COPY --from=build /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=build /app/packages ./packages
COPY --from=build /app/apps/notifications-service/package.json ./apps/notifications-service/

# Instala apenas dependências de produção
RUN pnpm install --prod --frozen-lockfile

# Copia o dist compilado para o diretório atual
COPY --from=build /app/apps/notifications-service/dist ./dist

EXPOSE 3004
CMD ["node", "dist/main.js"]