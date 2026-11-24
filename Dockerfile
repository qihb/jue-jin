# syntax=docker/dockerfile:1

# ===== 构建阶段 =====
# alpine（musl libc）镜像体积小，项目无原生依赖，可安全使用
FROM node:24-alpine AS builder

WORKDIR /app

# 启用 corepack 并锁定 pnpm 版本（与 packageManager 字段一致）
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

# 先拷贝依赖清单，利用 Docker 缓存层
COPY package.json pnpm-lock.yaml ./

# --frozen-lockfile：严格按 lockfile 安装，CI/构建环境推荐
RUN pnpm install --frozen-lockfile

# 拷贝项目源码
COPY . .

# 构建产物输出到 .output/
RUN pnpm build

# ===== 运行阶段 =====
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production \
    NITRO_PORT=3000 \
    HOST=0.0.0.0

# SQLite 数据目录（由 compose volume 挂载到宿主机，持久化）
RUN mkdir -p /app/data

# 只拷贝构建产物，镜像体积最小
COPY --from=builder /app/.output ./.output

EXPOSE 3000

# Nitro 生产入口
CMD ["node", ".output/server/index.mjs"]
