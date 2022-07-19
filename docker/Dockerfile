### Development stage
FROM node:14-alpine as development-stage

ARG NPM_CONFIG_ALWAYS_AUTH
ARG NPM_CONFIG_REGISTRY
ARG NPM_CONFIG__AUTH_TOKEN

WORKDIR /app

ENTRYPOINT ["/entrypoint.sh"]
COPY docker/entrypoint*.sh /
COPY .npmrc package*.json ./

RUN npm set progress=false && npm config set depth 0
RUN npm ci

EXPOSE 8080

### Build stage
FROM node:14-alpine as build-stage

ARG NPM_CONFIG_ALWAYS_AUTH
ARG NPM_CONFIG_REGISTRY
ARG NPM_CONFIG__AUTH_TOKEN

WORKDIR /app

COPY .npmrc package*.json ./

RUN npm ci && npm cache clean --force

COPY ./ ./

RUN npm run build

### Production stage
FROM nginx:1.19.5-alpine as production-stage

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY ./docker/nginx.conf /etc/nginx/conf.d/default.conf
