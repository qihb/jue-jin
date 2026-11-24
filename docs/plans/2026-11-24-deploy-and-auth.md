# 部署 + SQLite 持久化 + 登录真实化 · 落地计划

**目标**：把掘金复刻项目部署到阿里云 ECS（公网可访问），并将数据从内存 mock 迁入 SQLite 持久化，同时把「一键演示登录」真实化为 JWT Cookie 鉴权。

**技术栈 / 约束**：
- 部署：Docker Compose（ECS 已装 Docker），多阶段构建，Node 24，暴露 3000 端口
- 数据库：SQLite，使用 Node 24 内置 `node:sqlite`（零原生依赖，无需编译），不引入 ORM
- 鉴权：JWT（HttpOnly Cookie），使用 `jose` 库；演示账号一键登录
- 域名：先用公网 IP + HTTP（`http://121.43.208.113:3000`），后续有域名再加 Caddy/HTTPS
- 遵循 AGENTS.md：`app` ⇄ `server` 不互引，共享类型放 `shared/`，请求统一走 `useRequest`

**涉及文件**：
- 部署新增：`Dockerfile`、`docker-compose.yml`、`.dockerignore`、`docs/deploy.md`
- 数据层新增：`server/db/index.ts`（连接 + 建表 + 仓储）
- 数据层改造：`server/mock/seed.ts`（改为纯数据生成，启动时灌入 SQLite）、`server/api/**`（17 个接口从内存 `db` 改查 SQLite）
- 登录新增：`server/middleware/auth.ts`、`server/api/auth/login.post.ts`、`server/api/auth/logout.post.ts`
- 登录改造：`server/api/user/current.get.ts`（从 JWT 解析）、交互接口加鉴权、`app/composables/useAuth.ts`、`app/stores/user.ts`
- 依赖：`jose`（AGENTS.md 备案）

**关键决策（已确认）**：
- 部署方式：Docker Compose
- 域名/HTTPS：先用 IP + HTTP 跑通
- 登录：演示账号真实化（一键登录 → 真实 JWT）
- 数据持久化：SQLite（`node:sqlite`）

**执行约定**：本文件仅为计划；由用户指定步骤后再执行，每完成一步勾选 `- [ ]`。

---

## 步骤

### 步骤 1 · Docker 化部署（先用内存 mock 跑通公网访问）

- [x] 1.1 编写多阶段 `Dockerfile`：builder（node:24 + pnpm install --frozen-lockfile + pnpm build）→ runner（node:24-slim + 仅拷贝 `.output`）
- [x] 1.2 编写 `docker-compose.yml`：服务 `juejin`，端口 `3000:3000`，volume `./data:/app/data`，`restart: always`
- [x] 1.3 编写 `.dockerignore`（排除 node_modules / .output / .git / data）
- [x] 1.4 `docs/deploy.md`：服务器初始化（安全组放行 3000）、拉取代码、`docker compose up -d`、日志查看、更新流程
- [ ] 1.5 本地 `docker build` 验证镜像可构建（本机无 Docker 运行时，需在 ECS 上验证）

### 步骤 2 · SQLite 持久化层

- [x] 2.1 新增 `server/db/index.ts`：`node:sqlite` 连接（路径 `./data/juejin.db`，Docker 内 `/app/data/juejin.db`），建表 `users` / `articles` / `pins` / `comments` / `article_likes` / `article_collects` / `pin_likes`
- [x] 2.2 改造 `server/mock/seed.ts`：抽离纯数据生成函数 `generateMockData()`，不再 export 内存 `db`；由 `server/db/index.ts` 启动时检测空库则灌入
- [x] 2.3 仓储层：封装 `getArticles` / `getArticle` / `createArticle` / `getComments` / `createComment` / `toggleLike` / `toggleCollect` 等
- [x] 2.4 逐接口改造（17 个）：`article/*`、`pin/*`、`comment/*`、`creator/*`、`user/*`、`author/*`、`tag/*` 从内存 `db` 改查 SQLite
- [x] 2.5 验证：`pnpm dev` 启动后数据与改造前一致，重启服务数据不丢

### 步骤 3 · 登录真实化（JWT Cookie）

- [x] 3.1 安装 `jose`，AGENTS.md 备案
- [x] 3.2 `server/middleware/auth.ts`：解析 Cookie `jj-token`，校验 JWT，把用户挂到 `event.context.user`
- [x] 3.3 `server/api/auth/login.post.ts`：演示账号（不存在则创建），签发 JWT，`Set-Cookie: jj-token=...; HttpOnly; Path=/; SameSite=Lax`
- [x] 3.4 `server/api/auth/logout.post.ts`：清除 Cookie
- [x] 3.5 `server/api/user/current.get.ts`：返回 `event.context.user`，未登录返回 `null`
- [x] 3.6 交互接口加鉴权：`article/like`、`article/collect`、`comment/publish`、`pin/like`、`article/publish` 未登录返回 401
- [x] 3.7 前端：`useAuth` 的 `loginWithDemo` 改调 `/api/auth/login`，`logout` 调 `/api/auth/logout`；`user store` 初始从 `/api/user/current` 拉取
- [x] 3.8 验证：登录后刷新页面保持登录态，未登录点赞/发布被拦截并唤起登录弹窗

### 步骤 4 · 联调与部署更新

- [x] 4.1 `pnpm lint` / `pnpm typecheck` / `pnpm build` 全通过
- [ ] 4.2 重新构建镜像并部署到 ECS，公网访问验证
- [ ] 4.3 更新主计划文档 `docs/plans/2026-11-24-juejin-clone-nuxt.md` 当前状态

---

## 当前状态

- 步骤 1–3 全部完成，步骤 4.1（lint/typecheck/build）已通过
- 冒烟测试通过：登录签发 JWT Cookie、点赞/收藏切换正确、未登录返回 401、登出清除 Cookie
- 待执行：4.2 部署到 ECS 并公网验证，4.3 更新主计划文档
