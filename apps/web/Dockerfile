# syntax=docker/dockerfile:1.7

########## DEV ##########
FROM node:22.12-alpine AS development
WORKDIR /app
RUN npm install -g pnpm@10.18.3

# Copia manifestos do workspace para cache efetivo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages ./packages
COPY apps/api-gateway/package.json ./apps/api-gateway/
COPY apps/auth-service/package.json ./apps/auth-service/
COPY apps/tasks-service/package.json ./apps/tasks-service/
COPY apps/notifications-service/package.json ./apps/notifications-service/
COPY apps/web/package.json ./apps/web/
RUN pnpm install --frozen-lockfile

# Copia o código da web
COPY apps/web ./apps/web
WORKDIR /app/apps/web
EXPOSE 3000
CMD ["pnpm","run","dev","--","--host","0.0.0.0","--port","3000"]

########## BUILD PROD ##########
FROM development AS build
WORKDIR /app/apps/web
RUN pnpm run build

########## PROD (Caddy) ##########
FROM caddy:2-alpine AS production
# Copia build do Vite
COPY --from=build /app/apps/web/dist /srv
RUN pnpm install --prod
EXPOSE 80
EXPOSE 443
CMD ["caddy", "file-server", "--root", "/srv", "--listen", ":80"]