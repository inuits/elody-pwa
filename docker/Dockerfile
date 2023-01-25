### Build stage
FROM node:18-alpine as build-stage

ARG NPM_CONFIG_ALWAYS_AUTH
ARG NPM_CONFIG_REGISTRY
ARG NPM_CONFIG__AUTH_TOKEN

RUN corepack enable && corepack prepare pnpm@7.26.0 --activate

COPY ../ ./app/

RUN pnpm i

WORKDIR /app/

RUN pnpm i && pnpm cache clean --force

RUN pnpm run build

### Production stage
FROM nginx:1.19.5-alpine as production-stage

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY ./docker/nginx.conf /etc/nginx/conf.d/default.conf
