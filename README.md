# 掘金（juejin.cn）复刻 · Nuxt 4 SSR

用 Nuxt 4 复刻掘金社区核心功能，产出一个 SSR 可用、可交互、可演示的完整前端站点。

**在线访问**：http://121.43.208.113:3000

**一键演示登录**：站点内置演示账号 `juejin_1`，无需注册即可体验登录后功能。
- 访问 [/login](http://121.43.208.113:3000/login)，点击下方 **「一键演示登录」** 按钮即可登录
- 其他页面（文章详情 / 沸点 / 关注流等）触发点赞、评论、关注等操作时，也会弹出一键演示登录入口
- 登录后可体验：点赞 / 收藏 / 评论 / 关注 / 发布沸点 / 创作者中心 / 消息中心等交互

---

## 技术栈

| 分类 | 选型 | 版本 |
| --- | --- | --- |
| 框架 | Nuxt 4（Vue 3.5 + Nitro 2） | 4.x |
| 语言 | TypeScript（strict） | 5.9 |
| 样式 | Tailwind CSS v4（`@tailwindcss/vite`） | v4 |
| 图标 | @nuxt/icon + Iconify（本地图标集 `@iconify-json/lucide`） | SSR 直出内联 SVG，不依赖在线 API |
| 工具库 | @vueuse/nuxt | 优先复用 |
| 状态 | Pinia（`@pinia/nuxt`） | — |
| 编辑器 | @bytemd/vue-next + bytemd | 掘金同源 Markdown 编辑器 |
| 数据库 | SQLite（Node 24 内置 `node:sqlite`） | 零原生依赖 |
| 鉴权 | JWT（`jose`，HttpOnly Cookie） | HS256，7 天过期；生产必须注入 `JWT_SECRET` |
| 部署 | Docker Compose | 多阶段构建 |
| 测试 | Vitest | 纯函数单测（`tests/`） |
| CI | GitHub Actions | lint → typecheck → test → build |
| 规范 | @nuxt/eslint + Prettier + Oxlint | 提交前必过 |
| 包管理 | pnpm | 10.33.0 |

**运行环境**：Node `^22.21.0 || ^24.11.0 || >=26.0.0`（当前固定 `24.11.0`）

---

## 功能特性

### 已实现

- **首页文章流**：分类标签栏（推荐/关注/后端/前端/Android/iOS/人工智能…）、无限滚动加载、文章卡片、骨架屏
- **文章详情**：Markdown 渲染 + 代码高亮、目录 TOC 滚动高亮、点赞/收藏/评论/分享、作者卡、相关推荐、SEO meta
- **沸点**：沸点列表 + 分页、沸点详情 + 评论、点赞、发布沸点（正文 + 图片 URL + 话题）
- **文章编辑器**：ByteMD Markdown 编辑/预览、标题/封面/分类/标签/摘要、本地草稿自动保存、草稿箱
- **创作者中心**：数据概览（统计卡 + 近 7 日阅读量柱状图）、内容管理、草稿列表
- **全局布局**：顶部导航（搜索框 / 创作者中心下拉 / 消息铃铛 / 头像下拉）、右侧栏（签到/作者榜/热门话题）、暗色主题（头像下拉内切换）、移动端抽屉
- **用户体系**：真实账号密码注册/登录（scrypt 哈希 + JWT HttpOnly Cookie，保留一键演示登录）、用户主页（文章/沸点/收藏集/赞过/关注 五 Tab）、个人设置（资料编辑 / 账号安全）、真实关注关系（首页「关注」流按关注过滤）
- **搜索 / 标签 / 排行榜 / 小册**：站内搜索（文章/用户/标签/小册）、标签页、作者榜/文章榜、小册列表与详情
- **消息中心 / 收藏集**：消息通知（赞和收藏/评论/@我/关注/系统 + 未读角标）、收藏集列表与详情
- **数据持久化**：SQLite 存储用户/文章/沸点/评论/点赞/收藏/关注关系，重启服务数据不丢
- **SSR 首屏**：所有页面服务端渲染，SEO 友好（sitemap + robots.txt）

### 待实现

- HTTPS（需域名）

---

## 快速开始

### 环境准备

```bash
# 确保 Node 版本（必须 22.21+ 或 24.11+）
nvm use

# 安装依赖
pnpm install --frozen-lockfile
```

### 本地开发

```bash
pnpm dev
# 访问 http://localhost:3000
```

### 生产构建

```bash
pnpm build
pnpm preview
```

### 代码质量

```bash
pnpm lint          # ESLint + Oxlint 校验
pnpm lint:fix      # 自动修复
pnpm format        # Prettier 格式化
pnpm typecheck     # vue-tsc 类型检查
pnpm test          # Vitest 纯函数单测
```

---

## 部署

### Docker Compose 部署

```bash
# 1. 克隆代码
git clone <repo-url> && cd juejin

# 2. 注入 JWT 密钥（必填）：compose 从同目录 .env 读取（.env 已在 .gitignore 中）
echo "JWT_SECRET=$(openssl rand -hex 32)" > .env
# 也可改用 shell 环境变量：export JWT_SECRET=$(openssl rand -hex 32)

# 3. 构建并启动
docker compose up -d --build

# 4. 查看日志
docker logs -f juejin
```

> **JWT_SECRET 必填**：`docker-compose.yml` 使用 `${JWT_SECRET:?...}` 强制注入，未提供时 compose 直接报错；
> 应用在 `NODE_ENV=production` 且缺少该变量时也会**启动即退出**，避免静默使用弱密钥。
> 因此本地执行 `pnpm preview` 前同样需要先设置 `JWT_SECRET`。

### 更新部署

```bash
git pull
docker compose up -d --build
```

### 数据备份

SQLite 数据持久化在 `./data/juejin.db`：

```bash
tar czf juejin-data-backup.tar.gz ./data/
```

详细部署步骤见 [docs/deploy.md](docs/deploy.md)。

---

## 项目结构

```
juejin/
├─ app/              # 前端代码（Nuxt 4 app 目录分层）
│  ├─ components/    # 组件（base/ layout/ article/ pin/ comment/ editor/ creator/）
│  ├─ composables/   # 组合式函数（useAuth/ useArticleFeed/ useRequest/ useTheme…）
│  ├─ layouts/       # 布局（default/ article/ editor）
│  ├─ middleware/    # 路由守卫（auth）
│  ├─ pages/         # 文件路由
│  ├─ plugins/       # 插件（auth 会话恢复）
│  ├─ stores/        # Pinia 状态（user/ app/ draft）
│  └─ utils/         # 工具函数（format/ markdown）
├─ server/           # Nitro 服务端
│  ├─ api/           # 接口（article/ pin/ comment/ user/ auth/ creator/ tag/ book/ collection/ notification/ rank/ author/ search/ health）
│  ├─ db/            # SQLite 数据层（schema 建表/迁移 + repositories/ 分领域仓储）
│  ├─ middleware/    # Nitro 中间件（auth JWT 解析）
│  ├─ mock/          # 种子数据生成
│  ├─ plugins/       # Nitro 启动插件（jwt-guard：生产缺失密钥直接退出）
│  └─ utils/         # 工具（resp 统一响应 / auth JWT 签发 / password scrypt）
├─ shared/           # client 与 server 共享的类型、常量、纯函数
├─ tests/            # Vitest 纯函数单测
├─ docs/             # 计划与设计文档
├─ .github/workflows # CI（lint / typecheck / test / build）
└─ public/           # 静态资源
```

**依赖方向**：`app` ──► `shared` ◄── `server`（`app` 与 `server` 禁止互相 import）

---

## 接口约定

### 统一响应体

```ts
interface ApiResp<T> {
  err_no: number   // 0 表示成功
  err_msg: string
  data: T
}
```

### 分页

统一使用 `limit` + `cursor` 游标分页，返回 `{ list, cursor, hasMore }`。

### 主要接口

| 方法 | 路径 | 说明 | 鉴权 |
| --- | --- | --- | --- |
| GET | `/api/article/feed` | 文章列表（分类/分页） | - |
| GET | `/api/article/:id` | 文章详情 | - |
| POST | `/api/article/like` | 点赞/取消点赞 | ✅ |
| POST | `/api/article/collect` | 收藏/取消收藏 | ✅ |
| POST | `/api/article/publish` | 发布文章 | ✅ |
| GET | `/api/pin/list` | 沸点列表 | - |
| GET | `/api/pin/:id` | 沸点详情 | - |
| POST | `/api/pin/like` | 沸点点赞 | ✅ |
| POST | `/api/pin/publish` | 发布沸点 | ✅ |
| GET | `/api/comment/list` | 评论列表 | - |
| POST | `/api/comment/publish` | 发表评论 | ✅ |
| POST | `/api/auth/login` | 账号密码登录 / 无 body 一键演示登录 | - |
| POST | `/api/auth/register` | 注册（用户名 + 昵称 + 密码） | - |
| POST | `/api/auth/password` | 修改密码 | ✅ |
| POST | `/api/auth/logout` | 登出 | - |
| GET | `/api/user/current` | 当前用户 | - |
| GET | `/api/user/:id` | 用户主页资料（含关注态） | - |
| GET | `/api/user/:id/:tab` | 用户内容列表（articles/pins/collections/likes/following） | - |
| POST | `/api/user/follow` | 关注 / 取关 | ✅ |
| POST | `/api/user/profile` | 更新个人资料 | ✅ |
| GET | `/api/creator/overview` | 创作者概览 | - |
| GET | `/api/creator/contents` | 创作者内容列表 | ✅ |
| GET | `/api/search` | 站内搜索（文章/用户/标签/小册） | - |
| GET | `/api/tag/list` | 标签列表 | - |
| GET | `/api/tag/:tag` | 标签详情 + 标签下文章 | - |
| GET | `/api/author/rank` | 作者榜 | - |
| GET | `/api/rank/article` | 文章阅读榜 | - |
| GET | `/api/book/list` | 小册列表 | - |
| GET | `/api/book/:id` | 小册详情 | - |
| GET | `/api/collection/list` | 收藏集列表 | ✅ |
| GET | `/api/collection/:id` | 收藏集详情（公开可读） | - |
| GET | `/api/notification/list` | 消息列表（Tab + 分页，未登录返回空页） | - |
| GET | `/api/notification/unread` | 未读统计 | - |
| POST | `/api/notification/read` | 标记已读 | ✅ |
| GET | `/api/health` | 健康检查 | - |

---

## 开发规范

完整规范见 [AGENTS.md](AGENTS.md)。核心要求：

- TypeScript strict，禁止裸 `any`
- 组件只负责展示与交互，禁止直连接口（数据通过 props / composables 注入）
- 所有请求只允许出现在 `composables/` 或页面的 `useAsyncData` 中
- 颜色/间距全部走 token，禁止魔法色值
- 纯函数逻辑（格式化 / 分页 / 密码 / 常量守卫）补 Vitest 单测，改动后 `pnpm test` 需全绿

---

## License

MIT
