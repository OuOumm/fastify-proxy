FROM node:24-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm --no-cache && \
    pnpm install --prod --frozen-lockfile && \
    rm -rf /usr/local/lib/node_modules/pnpm /root/.npm /root/.pnpm-store

FROM node:24-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY app.js index.html config.json favicon.ico ./

EXPOSE 23000

CMD ["node", "app.js"]