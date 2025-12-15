FROM node:24-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

# 使用pnpm的store-dir选项并清理更彻底
RUN npm install -g pnpm && \
    pnpm install --prod --no-frozen-lockfile --store-dir=/tmp/pnpm-store && \
    rm -rf /usr/local/lib/node_modules/pnpm /root/.npm /tmp/pnpm-store && \
    # 只保留必要的文件
    find node_modules -type f -not -name "*.js" -not -name "package.json" -delete && \
    find node_modules -type d -name "__tests__" -o -name "test" -o -name "tests" -o -name "coverage" -o -name "docs" -o -name "examples" -o -name "benchmark" -o -name ".*" | xargs rm -rf

# 使用更小的alpine镜像
FROM node:24-alpine

WORKDIR /app

# 减少镜像层，合并复制命令
COPY --from=builder /app/node_modules ./node_modules
COPY app.js index.html config.json favicon.ico ./

# 清理alpine镜像中的不必要文件
RUN rm -rf /var/cache/apk/* /tmp/* /root/.npm

EXPOSE 23000

CMD ["node", "app.js"]