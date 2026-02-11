### Base stage
FROM node:18-alpine as base

RUN npm install -g pnpm
WORKDIR /app

FROM base as deps
COPY package.json pnpm-lock.yaml* ./

ARG NPM_CONFIG_ALWAYS_AUTH
ARG NPM_CONFIG_REGISTRY
ARG NPM_CONFIG__AUTH_TOKEN

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install

### Test stage
FROM deps as test-stage

COPY . .

RUN mkdir -p /app/src/generated-types && \
    touch /app/src/generated-types/queries.ts

RUN pnpm run test:unit