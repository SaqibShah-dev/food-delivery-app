# syntax=docker/dockerfile:1

ARG NODE_VERSION=24-bookworm-slim

# Compile TypeScript
FROM node:${NODE_VERSION} AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm \
    npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build


# Install production dependencies only
FROM node:${NODE_VERSION} AS production-dependencies

WORKDIR /app

COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev \
    && npm cache clean --force


# Minimal production runtime
FROM node:${NODE_VERSION} AS runtime

ENV NODE_ENV=production
ENV PORT=5000

WORKDIR /app

COPY --from=production-dependencies --chown=node:node \
    /app/node_modules ./node_modules

COPY --from=build --chown=node:node \
    /app/dist ./dist

COPY --chown=node:node package.json ./

RUN mkdir -p /app/uploads \
    && chown node:node /app/uploads

USER node

EXPOSE 5000

CMD ["node", "dist/server.js"]