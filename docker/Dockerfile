### Base stage
FROM node:22-bookworm-slim AS base

RUN npm install -g pnpm@10.33.4
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml* .npmrc* ./

ARG NPM_CONFIG_ALWAYS_AUTH
ARG NPM_CONFIG_REGISTRY
ARG NPM_CONFIG__AUTH_TOKEN

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install

### Test stage
FROM deps AS test-stage

COPY . .

RUN mkdir -p /app/src/generated-types && \
  touch /app/src/generated-types/queries.ts

RUN pnpm run test:unit -- --maxWorkers=2

### Ship stage: raw PWA source only.
# Client builds copy /app into their own build and run pnpm install there,
# so shipping node_modules only bloats the image (>1 GB vs ~15 MB of source)
# and slows down every client pipeline that pulls it.
# The COPY --from=test-stage line forces the unit tests to run even though
# this stage does not otherwise depend on them.
FROM node:22-bookworm-slim AS build-stage
COPY --from=test-stage /app/package.json /tmp/.unit-tests-passed
WORKDIR /app
COPY . .
