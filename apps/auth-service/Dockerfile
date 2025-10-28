# Multi-stage Dockerfile for Auth Service

# Base image with Node.js
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Dependencies stage
FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
COPY packages/types/package.json ./packages/types/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY apps/auth-service/package.json ./apps/auth-service/
RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build shared packages first
RUN pnpm build --filter=@task-management/types

# Build the Auth Service
RUN pnpm build --filter=auth-service

# Development stage
FROM base AS development
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Install dependencies for development
RUN pnpm install

EXPOSE 3002

# Start in development mode with hot reload
CMD ["pnpm", "--filter=auth-service", "start:dev"]

# Production stage
FROM base AS production
WORKDIR /app

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/apps/auth-service/package.json ./apps/auth-service/package.json

EXPOSE 3002

# Start in production mode
CMD ["node", "dist/apps/auth-service/main.js"]