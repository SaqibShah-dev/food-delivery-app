# syntax=docker/dockerfile:1

ARG NODE_VERSION=24-bookworm-slim

# Build the Vite application
FROM node:${NODE_VERSION} AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm \
    npm ci

COPY . .

ARG VITE_API_BASE_URL=http://localhost:5000/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build


# Serve the compiled application
FROM nginx:stable-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]