FROM node:24-alpine

WORKDIR /app

# 启用 corepack 并安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 安装生产依赖
RUN pnpm install --prod --frozen-lockfile

# 复制应用文件
COPY app.js index.html favicon.ico ./
COPY config-demo.json ./config.json

# 暴露端口
EXPOSE 23000 23001

CMD ["node", "app.js"]