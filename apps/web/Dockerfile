FROM node:22-alpine AS build

WORKDIR /app

ARG NEXT_PUBLIC_API_URL=""
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/order-worker/package.json apps/order-worker/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/contracts/package.json packages/contracts/package.json

RUN npm ci

COPY apps/web apps/web
COPY packages/contracts packages/contracts

RUN npm --prefix apps/web run build

FROM nginx:1.27-alpine AS runtime

COPY apps/web/nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/apps/web/out /usr/share/nginx/html

ENV API_UPSTREAM=http://api:3000

EXPOSE 80
