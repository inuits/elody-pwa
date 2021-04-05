### Development stage
FROM node:lts-alpine as development-stage

ARG NPM_AUTH_TOKEN
# We need to set NPM_AUTH_TOKEN build ARG to ENV because we need valid .npmrc file for development aswell
ENV NPM_AUTH_TOKEN=$NPM_AUTH_TOKEN

WORKDIR /app

COPY .npmrc package.json package-lock.json ./

RUN npm install
CMD npm run serve
EXPOSE 8080

### Build stage
FROM node:lts-alpine as build-stage

ARG NPM_AUTH_TOKEN

WORKDIR /app

COPY .npmrc package.json package-lock.json ./

RUN npm install

COPY ./ ./

RUN npm run build

### Production stage
FROM nginx:1.19.5-alpine as production-stage

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build-stage /dist /usr/share/nginx/html
COPY ./docker/nginx.conf /etc/nginx/conf.d/default.conf
