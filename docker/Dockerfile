### Build stage
FROM node:18-alpine as build-stage

COPY ./ ./app/

WORKDIR /app/

### Test stage
FROM build-stage as test-stage

RUN npm install -g pnpm

ARG NPM_CONFIG_REGISTRY
ARG NPM_CONFIG__AUTH_TOKEN

RUN echo "registry=${NPM_CONFIG_REGISTRY}" > /app/.npmrc && \
    echo "//nexus.inuits.io/repository/:_authToken=${NPM_CONFIG__AUTH_TOKEN}" >> /app/.npmrc

RUN mkdir -p /app/src/generated-types && \
touch /app/src/generated-types/queries.ts

RUN pnpm install

RUN cat package.json | grep test:unit

RUN echo "Starting tests..." && pnpm run test:unit && echo "Tests finished ✅"
