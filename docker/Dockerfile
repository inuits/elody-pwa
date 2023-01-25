### Development stage
FROM node:18 as development-stage

ARG NPM_CONFIG_ALWAYS_AUTH
ARG NPM_CONFIG_REGISTRY
ARG NPM_CONFIG__AUTH_TOKEN

RUN corepack enable && corepack prepare pnpm@7.26.0 --activate

COPY inuits-dams-frontend/  ./app/
COPY inuits-dams-frontend/docker/entrypoint.sh ./

WORKDIR /app
ENTRYPOINT ["/entrypoint.sh"]
RUN pnpm i

WORKDIR /app/inuits-dams-pwa

RUN pnpm set progress=false && pnpm config set depth 0 && pnpm run generate
RUN mkdir -p /app/node_modules/.vite && chown -R node:node /app/node_modules/.vite
USER node

EXPOSE 8080

### Build stage
FROM node:18-alpine as build-stage

ARG NPM_CONFIG_ALWAYS_AUTH
ARG NPM_CONFIG_REGISTRY
ARG NPM_CONFIG__AUTH_TOKEN

COPY inuits-dams-frontend/ ./app/

RUN pnpm i

WORKDIR /app/inuits-dams-pwa

RUN pnpm i && pnpm cache clean --force

RUN pnpm run build

### Production stage
FROM nginx:1.19.5-alpine as production-stage

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY ./docker/nginx.conf /etc/nginx/conf.d/default.conf
