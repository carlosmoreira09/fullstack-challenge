# syntax=docker/dockerfile:1.7
FROM node:22.12-alpine AS base
WORKDIR /app
RUN npm install -g pnpm@10.18.3

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages ./packages
COPY apps/api-gateway/package.json ./apps/api-gateway/
COPY apps/auth-service/package.json ./apps/auth-service/
COPY apps/tasks-service/package.json ./apps/tasks-service/
COPY apps/notifications-service/package.json ./apps/notifications-service/
COPY apps/web/package.json ./apps/web/
RUN pnpm install --frozen-lockfile

FROM deps AS development
COPY apps/notifications-service ./apps/notifications-service
WORKDIR /app/apps/notifications-service
EXPOSE 3004
CMD ["pnpm","run","dev"]

FROM deps AS build
COPY apps/notifications-service ./apps/notifications-service
WORKDIR /app/apps/notifications-service
RUN pnpm run build

FROM node:22.12-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
RUN npm install -g pnpm@10.18.3
COPY --from=build /app/apps/notifications-service/dist ./dist
COPY apps/notifications-service/package.json ./
RUN pnpm install --prod --frozen-lockfile --ignore-scripts
EXPOSE 3004
CMD ["node","dist/main.js"]