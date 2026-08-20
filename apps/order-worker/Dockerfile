FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/order-worker/package.json apps/order-worker/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/contracts/package.json packages/contracts/package.json

RUN npm ci

COPY apps/order-worker apps/order-worker

RUN npm --prefix apps/order-worker run build

FROM node:22-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/order-worker/package.json apps/order-worker/package.json
COPY --from=build /app/apps/order-worker/dist apps/order-worker/dist

CMD ["node", "apps/order-worker/dist/main.js"]
