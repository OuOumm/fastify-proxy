<div align="center">

# Fastify 高性能反向代理服务器
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D24.0.0-brightgreen.svg)](https://nodejs.org/) [![Fastify](https://img.shields.io/badge/Fastify-5.x-blue.svg)](https://fastify.dev/) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

一个基于 Fastify 构建的高性能、轻量级反向代理服务器，支持 CDN 加速和动态代理功能。自动集成 GitHub Actions 进行 Docker 构建和推送。
</div>

## 🌟 项目特性

- ⚡ **极致性能**：基于 Fastify 框架，提供超高性能的 HTTP 代理服务
- 🔄 **智能路由**：支持静态路由规则和动态代理配置
- 🌐 **CDN 集成**：内置 jsDelivr CDN 加速支持
- 🛡️ **安全可靠**：完善的错误处理和请求验证
- 🎯 **易于部署**：零配置启动，支持 Docker 容器化
- 📱 **响应式设计**：内置美观的 404 页面和响应式界面

## 🚀 快速开始

### 环境要求

- Node.js ≥ 24
- pnpm ≥ 10.13.1（推荐）

### 安装步骤

#### 1. 克隆项目

```bash
git clone https://github.com/ououmm/fastify-proxy.git
cd fastify-proxy
```

#### 2. 安装依赖

使用 pnpm（推荐）：
```bash
pnpm install
```

或使用 npm/yarn：
```bash
npm install
# 或
yarn install
```

#### 3. 配置文件

将配置示例文件重命名为正式配置文件：

```bash
cp config-demo.json config.json
```

#### 4. 启动服务

**开发模式**（带热重载）：
```bash
pnpm dev
```

**生产模式**：
```bash
pnpm start
```

**Node.js 原生监控模式**：
```bash
pnpm watch
```

服务将在 `http://localhost:23000` 启动。

## 📖 使用说明

### 代理规则配置

项目内置以下代理规则（定义在 `config-demo.json` 文件中，需重命名为 `config.json` 后使用）：

#### 1. GitHub CDN 加速
- **路径前缀**：`/gh/`
- **目标**：`https://gcore.jsdelivr.net/gh/`
- **用途**：加速 GitHub 仓库文件访问
- **自定义请求头**：`{ "x-test": "test" }`

**示例**：
```
原始地址：https://raw.githubusercontent.com/user/repo/main/file.js
代理地址：http://localhost:23000/gh/user/repo/main/file.js
```

#### 2. 动态代理
- **路径前缀**：`/proxy/`
- **功能**：支持任意 URL 的动态代理
- **用法**：在 `/proxy/` 后直接添加完整的目标 URL

**示例**：
```
目标网站：https://example.com/api/data
代理地址：http://localhost:23000/proxy/https://example.com/api/data
```

### API 接口

#### 健康检查
- **GET** `/` - 返回服务状态页面
- **GET** `/favicon.ico` - 返回站点图标

#### 代理接口
- **ALL** `/gh/*` - GitHub CDN 代理
- **ALL** `/proxy/*` - 动态代理接口

支持所有 HTTP 方法（GET、POST、PUT、DELETE、PATCH 等）。

## 🐳 Docker 部署

### 自动构建

项目已集成 GitHub Actions，当代码推送到 `main` 分支或创建版本标签时，会自动构建 Docker 镜像并推送到 GitHub Packages Docker 注册表。

### 手动构建与运行

```bash
# 构建镜像
docker build -t fastify-proxy .

# 运行容器
docker run -d -p 23000:23000 --name fastify-proxy fastify-proxy
```

### Docker Compose

```yaml
version: '3.8'
services:
  fastify-proxy:
    build: .
    ports:
      - "23000:23000"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    volumes:
      - ./config.json:/app/config.json:ro
    # 注意：首次运行需将 config-demo.json 重命名为 config.json
```

### 使用 GitHub Packages 镜像

```bash
# 拉取镜像
docker pull ghcr.io/OuOumm/fastify-proxy:latest

# 运行容器
docker run -d -p 23000:23000 --name fastify-proxy ghcr.io/OuOumm/fastify-proxy:latest
```

## ⚙️ 配置说明

### 环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `PORT` | 23000 | 服务监听端口 |
| `NODE_ENV` | development | 运行环境 |

### 自定义配置

如需自定义代理规则，请编辑 `config-demo.json` 文件后重命名为 `config.json`：

```json
[
  {
    "prefix": "/your-prefix/",
    "target": "https://your-target.com/",
    "headers": { "Custom-Header": "value" },
    "isDynamic": false
  },
  // 添加更多规则...
]
```

## 🧪 开发指南

### 项目结构

```
fastify-proxy/
├── app.js              # 主应用文件
├── package.json        # 项目配置
├── index.html          # 主页模板
├── favicon.ico         # 站点图标
├── config-demo.json    # 代理规则配置示例（需重命名为 config.json 使用）
├── Dockerfile          # Docker 构建文件
├── .dockerignore       # Docker 忽略规则
├── .github/
│   └── workflows/
│       └── docker-build.yml  # GitHub Actions 工作流
├── .gitignore          # Git 忽略规则
├── LICENSE             # 许可证文件
└── README.md           # 项目文档
```

### 开发脚本

- `pnpm start` - 生产环境启动
- `pnpm dev` - 开发环境启动（nodemon）
- `pnpm watch` - Node.js 原生监控模式
- `pnpm test` - 运行测试（待实现）

### 代码规范

本项目遵循以下规范：
- **ESLint**: @antfu/eslint-config
- **Prettier**: 代码格式化
- **Conventional Commits**: Git 提交规范
- **TypeScript**: 100% 类型安全（未来版本）

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发流程

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 提交规范

遵循 [Conventional Commits](https://conventionalcommits.org/) 规范：
- `feat`: 新功能
- `fix`: 修复问题
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建/工具配置

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源协议。

## 🙋‍♂️ 常见问题

### Q: 如何添加新的代理规则？
A: 编辑 `config-demo.json` 文件后重命名为 `config.json`，按照现有格式添加新的规则。

### Q: 支持 HTTPS 吗？
A: 均支持。

### Q: 如何部署到云平台？
A: 支持所有支持 Node.js 的云平台，如 Vercel、Netlify、Heroku 等。

---

<div align="center">
  <p>如果这个项目对你有帮助，请给个 ⭐️ 支持一下！</p>
  <p><sub>Built with ❤️ by <a href="https://github.com/OuOumm">@OuOumm</a></sub></p>
</div>