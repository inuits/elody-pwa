### Development stage
FROM node:14.17.6 as development-stage

ARG NPM_AUTH_TOKEN

WORKDIR /app

ENTRYPOINT ["/entrypoint.sh"]
COPY docker/entrypoint*.sh /
COPY .npmrc package*.json ./

RUN npm cache clean --force
RUN npm cache verify
RUN npm ci

EXPOSE 8080

### Build stage
FROM node:14.17.6-alpine3.12 as build-stage

ARG NPM_AUTH_TOKEN

WORKDIR /app

COPY .npmrc package*.json ./

RUN npm ci

COPY ./ ./

RUN npm run build

### Production stage
FROM nginx:1.19.5-alpine as production-stage

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY ./docker/nginx.conf /etc/nginx/conf.d/default.conf
