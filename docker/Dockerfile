### Development stage
FROM node:14.17.6 as development-stage

ARG NPM_AUTH_TOKEN
# We need to set NPM_AUTH_TOKEN build ARG to ENV because we need valid .npmrc file for development aswell
ENV NPM_AUTH_TOKEN=$NPM_AUTH_TOKEN

WORKDIR /app

ENTRYPOINT ["/entrypoint.sh"]
COPY docker/entrypoint*.sh /
COPY .npmrc package*.json ./

RUN npm install
EXPOSE 80

### Build stage
FROM node:14.17.6-alpine3.12 as build-stage

ARG NPM_AUTH_TOKEN

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY ./ ./

RUN npm run build

### Production stage
FROM nginx:1.19.5-alpine as production-stage

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY ./docker/nginx.conf /etc/nginx/conf.d/default.conf
