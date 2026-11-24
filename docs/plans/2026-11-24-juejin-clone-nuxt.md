# 掘金（juejin.cn）复刻 · 项目架构方案与落地计划

**目标**：用 Nuxt 4 复刻掘金社区核心功能（文章流、文章详情、沸点、用户体系、编辑器、搜索、小册、排行榜、消息中心），产出一个可运行、可交互、SSR 可用的完整前端站点。
**技术栈 / 约束**：见下方「一、技术选型」；规范约束以仓库根目录 [AGENTS.md](../../AGENTS.md) 为准。
**涉及文件**：新增（全新项目，无存量代码）——脚手架产物 + `app/` + `server/` + `shared/` + `docs/`。
**关键决策**：已确认——Nuxt 4 / Tailwind CSS v4 自研 UI / Nitro 内置 mock 接口 / TypeScript 严格模式 / pnpm / ESLint + Prettier + Oxlint / VueUse + Pinia。
**执行约定**：本文件仅为计划；由用户指定步骤后再执行，每完成一步勾选 `- [ ]` → `- [x]`。

---

## 一、技术选型

| 分类 | 选型 | 说明 |
| --- | --- | --- |
| 框架 | **Nuxt 4**（Vue 3.5 + Nitro 2） | 官方脚手架 `nuxi init` 初始化，目录采用 `app/` 分层 |
| 语言 | TypeScript（strict） | 类型统一收敛到 `shared/types`，禁止 `any` 裸用 |
| 样式 | **Tailwind CSS v4**（`@tailwindcss/vite`） | 设计 token 走 CSS 变量，原子类自研掘金风组件 |
| UI 图标 | `@nuxt/icon` + Iconify | 掘金用到的线性图标按需引入 |
| 组合式工具 | `@vueuse/nuxt` | 无限滚动、懒加载、暗色主题、防抖等 |
| 状态 | `pinia` + `@pinia/nuxt` | 登录态、UI 态、草稿态 |
| 数据 | **Nitro `server/api`** + 本地 JSON mock | 前后端一体，可真实 `$fetch`，后续可平滑换真接口 |
| 规范 | `@nuxt/eslint` + `prettier` + `oxlint` | 提交前 lint/format |
| 包管理 | **pnpm**（corepack 锁定） | 符合既有工具链习惯 |
| 渲染 | SSR 默认，切页 `<NuxtPage>` + 数据 `useAsyncData` | 文章详情做 SEO meta |

---

## 二、目录结构（Nuxt 4 分层）

```text
juejin/
├─ app/
│  ├─ app.vue                      # 根组件（含全局布局/主题初始化）
│  ├─ assets/css/
│  │  ├─ main.css                  # @import "tailwindcss" + @theme token
│  │  └─ markdown.css              # 文章正文排版（prose 风格自研）
│  ├─ components/
│  │  ├─ base/                     # BaseButton / BaseAvatar / BaseTabs / BaseTag / BaseModal / BaseSkeleton
│  │  ├─ layout/                    # AppHeader / AppFooter / AppSidebar / AppSearch / MessageBell
│  │  ├─ article/                   # ArticleCard / ArticleList / ArticleMeta / ArticleToc / ArticleActions / ArticleRecommend
│  │  ├─ comment/                   # CommentEditor / CommentList / CommentItem
│  │  ├─ pin/                       # PinCard / PinList / PinPublisher
│  │  ├─ user/                      # UserCard / UserStat / FollowButton
│  │  └─ common/                    # EmptyState / LoadMore / RankList / TagCloud / SignInCard
│  ├─ composables/                  # useAuth / useArticleFeed / usePagination / useTheme / useRequest
│  ├─ layouts/                      # default.vue / blank.vue / editor.vue
│  ├─ middleware/                   # auth.ts（需登录路由守卫）
│  ├─ pages/                        # 文件路由，详见「三、功能矩阵」
│  ├─ plugins/                      # 主题/请求拦截等 h5 端插件
│  ├─ stores/                       # user.ts / ui.ts / draft.ts
│  └─ utils/                        # formatTime / numberFormat / storage
├─ server/
│  ├─ api/                          # mock 接口（见「四、接口约定」）
│  ├─ mock/                         # 静态 JSON 数据源 + seed 生成器
│  └─ utils/                        # resp() 统一响应包装 / 分页游标
├─ shared/
│  ├─ types/                        # User / Article / Pin / Comment / Pagination ...
│  └─ constants/                    # 分类枚举 / 路由常量 / 配置
├─ public/                          # favicon、logo、静态图
├─ docs/plans/                      # 落地计划文档
├─ AGENTS.md                        # 项目架构与 AI 协作规范
├─ nuxt.config.ts
├─ eslint.config.mjs / .prettierrc / .oxlintrc.json
├─ tsconfig.json
└─ package.json
```

**职责边界（强约束）**：
- `app/components/*` 只做展示与交互，不直连接口；数据由 `pages` / `composables` 注入。
- 所有网络请求只允许出现在 `composables/` 或 `pages/` 的 `useAsyncData` 中，禁止组件内裸写 `$fetch`。
- 跨端共用的类型/常量只能放 `shared/`，禁止在 `server` 里 import `app` 内文件。

---

## 三、功能矩阵（掘金功能点 → 页面）

**全局框架**
- 顶部导航：Logo、首页、沸点、课程、商城、搜索框、创作者中心入口、消息铃铛、头像下拉（我的主页/我的收藏/设置/退出）
- 右侧栏：签到卡片、作者榜、热门话题、友情链接、App 下载

| # | 功能模块 | 路由 | 关键点 |
| --- | --- | --- | --- |
| 1 | 首页文章流 | `/` | 分类标签页（推荐/关注/后端/前端/Android/iOS/人工智能/开发工具/代码人生/阅读）、无限滚动、文章卡片 |
| 2 | 文章详情 | `/article/[id]` | Markdown 渲染、目录锚点跟随、点赞/收藏/评论/分享、作者卡、相关推荐、SEO meta |
| 3 | 沸点列表 / 详情 | `/pins`、`/pin/[id]` | 短内容流、点赞、评论、话题标签 |
| 4 | 发布沸点 | `/pins/publish`（弹窗/页） | 文本+图片、话题选择 |
| 5 | 文章编辑器 | `/editor`、`/editor/draft/[id]` | Markdown 编辑/预览、标题封面、分类标签、草稿箱、发布 |
| 6 | 分类 / 标签 | `/tag/[tag]` | 标签下文章列表、标签简介、关注标签 |
| 7 | 用户主页 | `/user/[id]` | Tab：文章/沸点/收藏/赞过/关注，个人资料与成就值 |
| 8 | 消息中心 | `/notification` | Tab：赞和收藏/评论/@我/关注/系统 |
| 9 | 搜索结果 | `/search?q=&type=` | 综合/文章/用户/标签/小册 分类结果 |
| 10 | 小册 | `/books`、`/book/[id]` | 小册列表、详情与目录 |
| 11 | 排行榜 | `/rank` | 作者榜 / 文章榜 |
| 12 | 登录 / 注册 | `/login`、`/register` | 账号密码/手机号，mock token 写入 Pinia + localStorage |
| 13 | 个人设置 | `/settings/profile`、`/settings/account` | 资料编辑、账号安全 |
| 14 | 创作中心 | `/creator` | 数据概览、内容管理、草稿列表 |
| 15 | 收藏集 | `/collection`、`/collection/[id]` | 收藏夹列表与详情 |
| 16 | 异常页 | `/404`、`/500` | 兜底页 |

---

## 四、接口与数据约定

- 统一响应体：
  ```ts
  interface ApiResp<T> { err_no: number; err_msg: string; data: T }
  ```
- 接口划分（`server/api/`）：
  - `article/`：`feed.get.ts`（分类流/分页）、`[id].get.ts`（详情）、`recommend.get.ts`、`publish.post.ts`
  - `pin/`：`list.get.ts`、`[id].get.ts`、`publish.post.ts`
  - `user/`：`[id].get.ts`、`login.post.ts`、`register.post.ts`、`follow.post.ts`、`current.get.ts`
  - `comment/`：`list.get.ts`、`publish.post.ts`
  - `search.get.ts`、`tag/[tag].get.ts`、`book/`、`rank/`、`notification/`、`collection/`
- 分页统一 `limit` + `cursor`（游标分页，适配无限滚动），返回 `{ list, cursor, hasMore }`。
- mock 数据由 `server/mock/seed.ts` 生成（固定随机种子，保证 SSR/CSR 数据一致）。

---

## 五、状态管理约定（Pinia）

| Store | 职责 |
| --- | --- |
| `user.ts` | 当前用户、token、登录/登出、关注关系 |
| `ui.ts` | 主题（亮/暗）、移动端抽屉、全局 loading |
| `draft.ts` | 编辑器草稿本地缓存与自动保存 |

登录态持久化：`localStorage` + 启动时 `plugins/auth.ts` 水合；`middleware/auth.ts` 拦截需登录路由。

---

## 六、规范约束

完整规范见 [AGENTS.md](../../AGENTS.md)。核心硬性要求：
1. TS strict，禁止裸 `any`（必要时 `unknown` + 类型收窄）。
2. 组件命名 `PascalCase`，文件名与组件名一致；`composables` 以 `use` 开头 `camelCase`。
3. 样式只用 Tailwind 原子类 + `@theme` token，禁止散落魔法色值；颜色统一走 `--color-jj-*` 变量。
4. 组件内禁止直连接口，禁止 `console.log` 残留。
5. 每个 feature 目录内自成体系（组件/组合式/类型就近放置），跨 feature 复用才上提到公共目录。

---

## 七、执行阶段

### 阶段 0 · 脚手架与工程规范 ✅
- [x] 0.1 用 nuxi 官方脚手架初始化 Nuxt 4 骨架（`-t minimal`；非交互终端必须显式 `--template`）
- [x] 0.2 接入 Tailwind v4（`@tailwindcss/vite`）+ 设计 token（`app/assets/css/main.css`）
- [x] 0.3 接入 Pinia、VueUse、@nuxt/icon、@nuxt/eslint（`nuxt.config.ts` modules）
- [x] 0.4 配置 ESLint + Prettier + Oxlint + TypeScript strict，补齐 `lint / format / typecheck` 脚本
- [x] 0.5 建立 `app/` `server/` `shared/` 目录骨架，以 `/api/health` + 首页自检页完成端到端校验

### 阶段 1 · 设计系统与全局布局 ✅
- [x] 1.1 抽取视觉 token（主色 #1e80ff、灰阶、圆角、阴影、字体，并补 `.dark` 暗色覆盖）—— `app/assets/css/main.css`
- [x] 1.2 `base/` 基础组件：Button / Avatar / Tabs / Tag / Modal / Skeleton / Empty —— `app/components/base/`
- [x] 1.3 `AppHeader` + `AppFooter` + `AppSidebar`，`default` 布局 —— `app/components/layout/`、`app/layouts/default.vue`（`nuxt.config.ts` 将 `layout/` 设为 `pathPrefix: false`，`app.vue` 补 `<NuxtLayout>`）
- [x] 1.4 暗色主题切换（`useTheme` + cookie 持久化 + `<html class="dark">`）—— `app/composables/useTheme.ts`

### 阶段 2 · mock 数据层与类型
- [ ] 2.1 `shared/types` 定义全部实体类型
- [ ] 2.2 `server/utils/resp.ts` 统一响应 + 游标分页工具
- [ ] 2.3 `server/mock/seed.ts` 生成用户/文章/沸点/评论/标签数据
- [ ] 2.4 `composables/useRequest` 统一请求封装与错误处理

### 阶段 3 · 首页文章流
- [ ] 3.1 分类标签栏（Tab 路由同步）
- [ ] 3.2 `ArticleCard` / `ArticleList` + 骨架屏
- [ ] 3.3 无限滚动加载（useInfiniteScroll）+ 分页兜底
- [ ] 3.4 右侧栏（签到/作者榜/热门话题/友情链接）

### 阶段 4 · 文章详情页
- [ ] 4.1 Markdown 渲染 + 代码高亮 + 正文排版
- [ ] 4.2 目录 TOC 生成与滚动高亮
- [ ] 4.3 点赞/收藏/评论/分享交互（含登录拦截）
- [ ] 4.4 作者卡、相关推荐、SEO meta

### 阶段 5 · 用户体系
- [ ] 5.1 登录 / 注册页 + mock 鉴权 + token 持久化
- [ ] 5.2 `middleware/auth` 路由守卫
- [ ] 5.3 用户主页（文章/沸点/收藏/赞过/关注 Tab）
- [ ] 5.4 个人设置页

### 阶段 6 · 沸点
- [ ] 6.1 沸点列表 + 分页
- [ ] 6.2 沸点详情 + 评论
- [ ] 6.3 发布沸点（文本 + 图片 + 话题）

### 阶段 7 · 编辑器与创作中心
- [ ] 7.1 Markdown 编辑器（编辑/预览双栏、工具栏）
- [ ] 7.2 标题 / 封面 / 分类标签 / 发布设置
- [ ] 7.3 草稿自动保存与草稿箱
- [ ] 7.4 创作者中心数据概览与内容管理

### 阶段 8 · 搜索 / 标签 / 排行榜 / 小册
- [ ] 8.1 全局搜索（防抖 + 分类结果）
- [ ] 8.2 标签页 `/tag/[tag]`
- [ ] 8.3 排行榜页
- [ ] 8.4 小册列表与详情

### 阶段 9 · 消息中心 / 收藏集
- [ ] 9.1 消息中心各 Tab
- [ ] 9.2 收藏集列表与详情
- [ ] 9.3 头部消息铃铛未读角标

### 阶段 10 · 收尾
- [ ] 10.1 响应式适配（移动端抽屉/单栏）
- [ ] 10.2 SEO / meta / sitemap
- [ ] 10.3 404/500 与全局错误处理
- [ ] 10.4 构建校验（`pnpm build` + `pnpm preview`）与性能自查

---

## 当前状态
- **阶段 0 已完成（0.1 ~ 0.5）**，验证结论：
  - `pnpm install --frozen-lockfile` ✅ · `pnpm lint`（oxlint + eslint）✅ · `pnpm typecheck` ✅ · `pnpm build` ✅
  - 运行时冒烟：SSR 输出含 Tailwind token 类名与 CSS 变量、Pinia 状态被序列化、`useAsyncData` 在 SSR 命中 `/api/health`（`err_no: 0`）✅
- **阶段 1 已完成（1.1 ~ 1.4）**，验证结论：
  - `pnpm lint` ✅（0 warning / 0 error）· `pnpm typecheck` ✅ · `pnpm build` ✅
  - 运行时冒烟（dev:3100）：SSR 输出含 `AppHeader`（Logo/导航/搜索/创作者中心/主题切换/消息/登录）、`AppSidebar`（签到/作者榜/热门话题/App 下载）、`AppFooter`；`<html>` class 随 cookie 变化（无 cookie / `jj-theme=light` → `class=""`，`jj-theme=dark` → `class="dark"`）✅
  - 生产 CSS 校验：`h-15`、`.dark`、`--color-jj-primary`、`bg-jj-gold/15`、`animate-pulse` 均已生成 ✅
- **环境已固化**：Node `24.11.0`（`.nvmrc` + `package.json#engines`）；pnpm `10.33.0`（`package.json#packageManager`）。执行任何命令前需先 `nvm use`——Node 20 会让 ESLint 10 因缺少 `Object.groupBy` 直接崩溃。
- **依赖偏离说明**：`typescript` 固定 `^5.9`（TS 7 超出 vue-tsc / @typescript-eslint 的 peer 范围）；补充 `cssnano` 消除 Nuxt PostCSS 构建告警。
- **环境事件（需知悉）**：`vite-plus` 于本次自动把 pnpm 由 `10.33.0` 升到 `12.23.0`，触发"store 不一致 → 重建 node_modules"并撞上 pnpm 12 默认的 `minimumReleaseAge`（24h）供应链策略，导致 `node_modules` 一度被清空。已通过 `packageManager: pnpm@10.33.0` 固定版本并用 `pnpm install --frozen-lockfile` 恢复，锁文件未改动。
- **已知取舍（用户决定）**：暂不安装 `@iconify-json/lucide`，图标在浏览器端向 Iconify 在线 API 拉取（需联网；SSR HTML 中不含图标 SVG）。后续若需离线/首屏图标，再补该 devDependency。
- 备注：`agent.md` 采用社区通用大写命名 `AGENTS.md`（macOS 文件系统不区分大小写）。
- 待办：阶段 2 及之后均**待用户指定步骤后执行**。
