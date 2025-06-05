### Build stage
FROM node:18-alpine as build-stage

COPY ./ ./app/

WORKDIR /app/

### Test stage
FROM build-stage as test-stage

RUN npm install -g pnpm

ARG NPM_CONFIG_ALWAYS_AUTH
ARG NPM_CONFIG_REGISTRY
ARG NPM_CONFIG__AUTH_TOKEN

RUN mkdir -p /app/src/generated-types && \
touch /app/src/generated-types/queries.ts

RUN pnpm install

RUN pnpm run test:unit
