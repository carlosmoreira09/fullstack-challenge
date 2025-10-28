# Multi-stage Dockerfile for API Gateway Service

# Base image with Node.js
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm@10.18.3

# Dependencies stage
FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
COPY pnpm-workspace.yaml turbo.json ./
COPY packages ./packages
COPY apps/api-gateway/package.json ./apps/api-gateway/

RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build shared packages first
RUN pnpm build --filter=@taskmanagerjungle/types

# Build the API Gateway
RUN pnpm build --filter=api-gateway

# Development stage
FROM base AS development
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Install dependencies for development
RUN pnpm install

EXPOSE 3001

# Start in development mode with hot reload
CMD ["pnpm", "--filter=api-gateway", "start:dev"]

# Production stage
FROM base AS production
WORKDIR /app

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/apps/api-gateway/package.json ./apps/api-gateway/package.json

EXPOSE 3001

# Start in production mode
CMD ["node", "dist/apps/api-gateway/main.js"]