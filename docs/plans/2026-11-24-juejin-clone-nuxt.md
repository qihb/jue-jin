# 掘金（juejin.cn）复刻 · 项目架构方案与落地计划

**目标**：用 Nuxt 4 复刻掘金社区核心功能（文章流、文章详情、沸点、用户体系、编辑器、搜索、小册、排行榜、消息中心），产出一个可运行、可交互、SSR 可用的完整前端站点。
**技术栈 / 约束**：见下方「一、技术选型」；规范约束以仓库根目录 [AGENTS.md](../../AGENTS.md) 为准。
**涉及文件**：新增（全新项目，无存量代码）——脚手架产物 + `app/` + `server/` + `shared/` + `docs/`。
**关键决策**：已确认——Nuxt 4 / Tailwind CSS v4 自研 UI / Nitro 内置 mock 接口 / TypeScript 严格模式 / pnpm / ESLint + Prettier + Oxlint / VueUse + Pinia。
**执行约定**：本文件仅为计划；由用户指定步骤后再执行，每完成一步勾选 `- [ ]` → `- [x]`。

---

## 一、技术选型

| 分类       | 选型                                              | 说明                                                |
| ---------- | ------------------------------------------------- | --------------------------------------------------- |
| 框架       | **Nuxt 4**（Vue 3.5 + Nitro 2）                   | 官方脚手架 `nuxi init` 初始化，目录采用 `app/` 分层 |
| 语言       | TypeScript（strict）                              | 类型统一收敛到 `shared/types`，禁止 `any` 裸用      |
| 样式       | **Tailwind CSS v4**（`@tailwindcss/vite`）        | 设计 token 走 CSS 变量，原子类自研掘金风组件        |
| UI 图标    | `@nuxt/icon` + Iconify                            | 掘金用到的线性图标按需引入                          |
| 组合式工具 | `@vueuse/nuxt`                                    | 无限滚动、懒加载、暗色主题、防抖等                  |
| 状态       | `pinia` + `@pinia/nuxt`                           | 登录态、UI 态、草稿态                               |
| 数据       | **Nitro `server/api`** + 本地 JSON mock           | 前后端一体，可真实 `$fetch`，后续可平滑换真接口     |
| 规范       | `@nuxt/eslint` + `prettier` + `oxlint`            | 提交前 lint/format                                  |
| 包管理     | **pnpm**（corepack 锁定）                         | 符合既有工具链习惯                                  |
| 渲染       | SSR 默认，切页 `<NuxtPage>` + 数据 `useAsyncData` | 文章详情做 SEO meta                                 |

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

| #   | 功能模块        | 路由                                     | 关键点                                                                                            |
| --- | --------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------- |
| 1   | 首页文章流      | `/`                                      | 分类标签页（推荐/关注/后端/前端/Android/iOS/人工智能/开发工具/代码人生/阅读）、无限滚动、文章卡片 |
| 2   | 文章详情        | `/article/[id]`                          | Markdown 渲染、目录锚点跟随、点赞/收藏/评论/分享、作者卡、相关推荐、SEO meta                      |
| 3   | 沸点列表 / 详情 | `/pins`、`/pin/[id]`                     | 短内容流、点赞、评论、话题标签                                                                    |
| 4   | 发布沸点        | `/pins/publish`（弹窗/页）               | 文本+图片、话题选择                                                                               |
| 5   | 文章编辑器      | `/editor`、`/editor/draft/[id]`          | Markdown 编辑/预览、标题封面、分类标签、草稿箱、发布                                              |
| 6   | 分类 / 标签     | `/tag/[tag]`                             | 标签下文章列表、标签简介、关注标签                                                                |
| 7   | 用户主页        | `/user/[id]`                             | Tab：文章/沸点/收藏/赞过/关注，个人资料与成就值                                                   |
| 8   | 消息中心        | `/notification`                          | Tab：赞和收藏/评论/@我/关注/系统                                                                  |
| 9   | 搜索结果        | `/search?q=&type=`                       | 综合/文章/用户/标签/小册 分类结果                                                                 |
| 10  | 小册            | `/books`、`/book/[id]`                   | 小册列表、详情与目录                                                                              |
| 11  | 排行榜          | `/rank`                                  | 作者榜 / 文章榜                                                                                   |
| 12  | 登录 / 注册     | `/login`、`/register`                    | 账号密码/手机号，mock token 写入 Pinia + localStorage                                             |
| 13  | 个人设置        | `/settings/profile`、`/settings/account` | 资料编辑、账号安全                                                                                |
| 14  | 创作中心        | `/creator`                               | 数据概览、内容管理、草稿列表                                                                      |
| 15  | 收藏集          | `/collection`、`/collection/[id]`        | 收藏夹列表与详情                                                                                  |
| 16  | 异常页          | `/404`、`/500`                           | 兜底页                                                                                            |

---

## 四、接口与数据约定

- 统一响应体：
  ```ts
  interface ApiResp<T> {
    err_no: number
    err_msg: string
    data: T
  }
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

| Store      | 职责                                    |
| ---------- | --------------------------------------- |
| `user.ts`  | 当前用户、token、登录/登出、关注关系    |
| `ui.ts`    | 主题（亮/暗）、移动端抽屉、全局 loading |
| `draft.ts` | 编辑器草稿本地缓存与自动保存            |

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

### 阶段 2 · mock 数据层与类型 ✅

- [x] 2.1 `shared/types` 定义全部实体类型（`common` / `user` / `tag` / `article` / `pin` / `comment` + `index.ts` 汇总）
- [x] 2.2 `server/utils/resp.ts` 统一响应 + 游标分页工具（`ok/fail/normalizeCursorQuery/paginate`）
- [x] 2.3 `server/mock/seed.ts` 生成用户/文章/沸点/评论/标签数据（固定种子 mulberry32，SSR/CSR 一致）
- [x] 2.4 `composables/useRequest` 统一请求封装与错误处理（并落地 7 个 mock 接口 + 首页接入自检）
- [x] 2.5 mock 接口：`article/feed`、`article/[id]`、`pin/list`、`pin/[id]`、`user/[id]`、`tag/list`、`author/rank`、`comment/list`
- [x] 2.6 首页接入数据层 + lint / typecheck / build / SSR 冒烟校验

### 阶段 3 · 首页文章流

- [x] 3.1 分类标签栏（Tab 路由同步）
- [x] 3.2 `ArticleCard` / `ArticleList` + 骨架屏
- [x] 3.3 无限滚动加载（useInfiniteScroll）+ 分页兜底
- [x] 3.4 右侧栏（签到/作者榜/热门话题/友情链接）
- [x] 3.5 lint / typecheck / build / SSR 冒烟校验 + 更新计划文档

### 阶段 4 · 文章详情页 ✅

- [x] 4.1 Markdown 渲染 + 代码高亮 + 正文排版
- [x] 4.2 目录 TOC 生成与滚动高亮
- [x] 4.3 点赞/收藏/评论/分享交互（含登录拦截）
- [x] 4.4 作者卡、相关推荐、SEO meta

### 阶段 5 · 用户体系

- [x] 5.1 登录鉴权 + token 持久化（演示账号一键登录 → 真实 JWT HttpOnly Cookie，见部署计划；独立登录/注册页已落地，见 [用户体系计划](./2026-11-24-user-system-and-pin-publish.md)）
- [x] 5.2 `middleware/auth` 路由守卫（Nitro 中间件解析 JWT，交互接口未登录返回 401）
- [x] 5.3 用户主页（文章/沸点/收藏/赞过/关注 Tab）
- [x] 5.4 个人设置页

### 阶段 6 · 沸点

- [x] 6.1 沸点列表 + 分页
- [x] 6.2 沸点详情 + 评论
- [x] 6.3 发布沸点（文本 + 图片 + 话题）

### 阶段 7 · 编辑器与创作中心

**目标**：产出可用的 Markdown 文章编辑器（编辑 / 预览 / 工具栏）、标题与发布设置、本地草稿自动保存与草稿箱、创作者中心概览。

**关键决策（已确认）**：

- **登录拦截**：走「演示登录弹窗」（与文章详情 / 沸点一致），不挂 `middleware/auth`；点「发布」时未登录先唤起 `BaseModal` 一键演示登录。
- **草稿存储**：纯本地持久化（Pinia + `useLocalStorage`），无服务端草稿接口，无登录归属依赖。
- **编辑器库**：引入 `@bytemd/vue-next`（掘金官方编辑器同源），配套 `bytemd` 核心 + `@bytemd/plugin-gfm` + `@bytemd/plugin-highlight`，样式走 `bytemd/dist/index.css`；编辑器依赖 DOM，页面内用 `<ClientOnly>` 包裹。需在 `AGENTS.md` 补依赖备案。

**涉及文件**：

- 新增（前端）：`app/layouts/editor.vue`、`app/pages/editor/index.vue`、`app/pages/editor/draft/[id].vue`、`app/pages/editor/drafts.vue`、`app/pages/creator/index.vue`
- 新增（组件）：`app/components/editor/`（`EditorWorkspace` / `EditorTitleBar` / `EditorPublishPanel`）、`app/components/creator/`（`CreatorOverview` / `CreatorContentList`）
- 新增（状态 / 组合式）：`app/stores/draft.ts`、`app/composables/useEditor.ts`、`app/composables/useDraft.ts`、`app/composables/useCreator.ts`
- 新增（mock 接口）：`server/api/article/publish.post.ts`、`server/api/creator/overview.get.ts`
- 修改：`AGENTS.md`（依赖备案 + §4 补充编辑器约定）、`app/components/layout/AppHeader.vue`（创作者中心入口接 `/creator`）、`shared/types`（新增 `CreatorOverview` 等类型）、`nuxt.config.ts`（如需补 css 引入）

**步骤**：

- [x] 7.0 依赖引入与备案：安装 `bytemd` / `@bytemd/vue-next` / `@bytemd/plugin-gfm` / `@bytemd/plugin-highlight`，引入 `bytemd/dist/index.css`，在 `AGENTS.md` 登记依赖
- [x] 7.1 编辑器骨架与 Markdown 编辑/预览：`layouts/editor.vue`（精简顶栏 + 全屏无侧栏）、`pages/editor/index.vue`、`EditorWorkspace`（`<ClientOnly>` 包 bytemd Editor + 插件 + 双栏预览）、`useEditor`（内容/标题/元信息状态聚合）
- [x] 7.2 标题 / 封面 / 分类标签 / 发布设置：`EditorTitleBar`（标题输入 + 字数统计）、`EditorPublishPanel`（分类选择走 `CONTENT_CATEGORIES`、标签、封面、摘要，弹窗形式）、mock `article/publish.post.ts`（演示登录校验 + 写入内存 db，缺封面/摘要时兜底）
- [x] 7.3 草稿自动保存与草稿箱：`stores/draft.ts`（localStorage 持久化 + 增删改查）、`useDraft`（debounce 自动保存、列表/删除）、`pages/editor/draft/[id].vue`（载入指定草稿）、`pages/editor/drafts.vue`（草稿箱：继续编辑 / 删除）
- [x] 7.4 创作者中心：`pages/creator/index.vue`（Tab：数据概览 / 内容管理 / 草稿列表）、`useCreator` + mock `creator/overview.get.ts`、`AppHeader` 创作者中心按钮接 `/creator`
- [x] 7.5 lint / typecheck / build / SSR 冒烟校验 + 更新计划文档

### 阶段 8 · 搜索 / 标签 / 排行榜 / 小册

- [x] 8.1 全局搜索（防抖 + 分类结果）
- [x] 8.2 标签页 `/tag/[tag]`
- [x] 8.3 排行榜页
- [x] 8.4 小册列表与详情

### 阶段 9 · 消息中心 / 收藏集

- [x] 9.1 消息中心各 Tab：`shared/types/notification.ts`（`NotificationTab` = 赞和收藏 / 评论 / @我 / 关注 / 系统、`NotificationItem`、`NotificationUnread`）、`shared/constants/notification.ts`（`NOTIFICATION_TABS` / `DEFAULT_NOTIFICATION_TAB` / `isNotificationTab` / `emptyNotificationUnread`）；`server/db` 新增 `notifications` 表 + mock 种子 + `listNotifications` / `countUnreadByTab` / `markNotificationsRead`；接口 `GET /api/notification/list`（Tab + 游标分页）、`GET /api/notification/unread`、`POST /api/notification/read`；`useNotification` + `pages/notification/index.vue`（Tab 与 URL query 同步、Tab 未读角标、全部已读）
- [x] 9.2 收藏集列表与详情：`shared/types/collection.ts`（`CollectionSummary` / `CollectionDetail`）；`server/db` 新增 `collections` + `collection_articles` 表 + mock 种子 + `listCollections(userId)` / `getCollectionById(id, userId)`；接口 `GET /api/collection/list`、`GET /api/collection/[id]`；`useCollectionList` / `useCollectionDetail` + `pages/collection/index.vue`、`pages/collection/[id].vue`
- [x] 9.3 头部消息铃铛未读角标：`useNotificationSummary`（未读总数）+ `AppHeader` 铃铛改为 `NuxtLink → /notification` 并叠加未读角标
- [x] 9.4 登录门控与 SSR 登录态修复：`CommonLoginGate`（一键演示登录，不 emit）；`useRequest` 在 SSR 改用 `useRequestFetch()` 透传 Cookie；登录态变化由页面 `watch(isLoggedIn)` 触发刷新
- [x] 9.5 lint / typecheck / build / SSR 冒烟校验 + 更新计划文档

### 阶段 10 · 收尾

**关键决策（用户确认）**：

- **响应式断点**：统一以 `lg`（1024px）为界。`≥ lg` 保持现有「顶部横向导航 + 双栏（内容 + 侧栏）」；`< lg` 收敛为「汉堡按钮 + 抽屉导航 + 单栏内容」，侧栏与文章目录隐藏。
- **sitemap 实现**：采用 `@nuxtjs/sitemap`（用户确认引入该依赖，固定 `9.1.0`），站点 URL 走 `runtimeConfig.public.siteUrl`；动态 URL（文章/沸点/小册/标签）由 `server/api/_sitemap-urls.ts`（`defineSitemapEventHandler`）提供，经 `sitemap.sources: ['/api/_sitemap-urls']` 注册。
- **全局错误提示**：`useRequest` 失败统一调用 `pushToast` 弹提示（SSR 阶段自动跳过），三个 layout 挂 `<CommonToast />`；页面渲染错误由 `app/error.vue` 兜底。

- [x] 10.1 响应式适配（移动端抽屉 / 单栏）：`AppNavDrawer` 抽屉导航、`AppHeader` 移动端收敛、文章详情/编辑器单栏回退
- [x] 10.2 SEO / meta / sitemap：默认 meta 补全、`useSeoMeta` 复核、`@nuxtjs/sitemap` + `robots.txt`
- [x] 10.3 404 / 500 与全局错误处理：`app/error.vue`、`useRequest` 失败统一提示（全局 Toast）
- [x] 10.4 构建校验（`pnpm build` + `pnpm preview`）与性能自查：包体、SSR 首屏、图片懒加载

---

## 当前状态

- **阶段 0 已完成（0.1 ~ 0.5）**，验证结论：
  - `pnpm install --frozen-lockfile` ✅ · `pnpm lint`（oxlint + eslint）✅ · `pnpm typecheck` ✅ · `pnpm build` ✅
  - 运行时冒烟：SSR 输出含 Tailwind token 类名与 CSS 变量、Pinia 状态被序列化、`useAsyncData` 在 SSR 命中 `/api/health`（`err_no: 0`）✅
- **阶段 1 已完成（1.1 ~ 1.4）**，验证结论：
  - `pnpm lint` ✅（0 warning / 0 error）· `pnpm typecheck` ✅ · `pnpm build` ✅
  - 运行时冒烟（dev:3100）：SSR 输出含 `AppHeader`（Logo/导航/搜索/创作者中心/主题切换/消息/登录）、`AppSidebar`（签到/作者榜/热门话题/App 下载）、`AppFooter`；`<html>` class 随 cookie 变化（无 cookie / `jj-theme=light` → `class=""`，`jj-theme=dark` → `class="dark"`）✅
  - 生产 CSS 校验：`h-15`、`.dark`、`--color-jj-primary`、`bg-jj-gold/15`、`animate-pulse` 均已生成 ✅
- **阶段 2 已完成（2.1 ~ 2.6）**，验证结论：
  - `pnpm lint` ✅（0 warning / 0 error）· `pnpm typecheck` ✅（exit 0）· `pnpm build` ✅（Client 315.31 kB / Nitro 1.92 MB）
  - 接口冒烟（preview:3100）：`/api/health`、`/api/article/feed?limit=2`、`/api/author/rank`、`/api/tag/list?limit=3`、`/api/article/feed?category=frontend` 均 `err_no: 0` 且游标 `hasMore/cursor` 正常，分类过滤生效 ✅
  - SSR 冒烟：首页 HTML 含 mock 数据（文章标题 `从 0 到 1 搭建 低代码 项目实战`、作者昵称 `摸鱼测试老张`、标签/图标类名 `i-lucide`、`__NUXT__` 载荷）✅
- **阶段 3 已完成（3.1 ~ 3.5）**，验证结论：
  - 交付：`useFeedCategory`（分类与 URL query 同步）、`ArticleCategoryTabs`、`ArticleCard`/`ArticleList` + 骨架屏、`useArticleFeed`（`useAsyncData` 首屏 + `useInfiniteScroll` 游标追加 + 手动「加载更多」兜底）、`useHomeSidebar` + `AppSidebar` 接真实作者榜/热门话题/友情链接、`app/utils/format.ts`（相对时间/计数格式化，基准时间走 `shared/constants` 的 `MOCK_BASE_TIME`）
  - `pnpm lint` ✅（0 warning / 0 error）· `pnpm typecheck` ✅（exit 0）· `pnpm build` ✅（Client 326.14 kB / Nitro 1.95 MB）
  - SSR 冒烟（preview:3100）：`/` 与 `/?category=frontend` 均返回 **HTTP 200**；首页直出 10 张文章卡、作者榜 5 条、热门话题标签、`__NUXT__` 载荷含 `article-feed:recommend` / `sidebar-author-rank` / `sidebar-hot-tags`；分类页 key 切换为 `article-feed:frontend` 且过滤生效 ✅
  - **阶段 3 踩坑与修复（NUXT_E1001）**：`useHomeSidebar` 原写法为连续两个 `await useAsyncData(...)`，第二个调用发生在第一个 `await` 之后，脱离了当前 Nuxt 实例上下文 → SSR 抛 `NUXT_E1001（nuxt instance unavailable）`、首页 500。修复：把两处 `useAsyncData` 收敛为同一同步阶段发起的 `await Promise.all([...])`（`useAsyncData` 必须在任何 `await` 之前调用）。经验：**在同一 composable 内多次调用 `useAsyncData` 时，必须并行发起，禁止串行 await**。
- **阶段 4 已完成（4.1 ~ 4.4）**，验证结论：
  - 交付（前端）：`app/utils/markdown.ts`（markdown-it `html:false` + highlight.js 按需子路径注册 6 种语言 + 目录收集）、`app/assets/css/markdown.css`（`.jj-markdown` 正文排版，代码高亮 token → 语义色）、`ArticleContent`；`layouts/article.vue` 与 `pages/article/[id].vue`（详情布局 + 动态 SEO meta）；`ArticleMeta` / `ArticleActions` / `ArticleToc`（滚动高亮）/ `ArticleAuthorCard` / `ArticleRecommend`；`CommentEditor` / `CommentList` / `CommentItem`（一层回复）；`AppHeader` 接入占位登录态（已登录显示头像/昵称/退出）
  - 交付（状态与数据层）：`app/stores/user.ts`（cookie 持久化）、`app/composables/useAuth.ts`、`app/composables/useArticleDetail.ts`（`Promise.all` 并行发起 3 处 `useAsyncData`：详情/评论/相关推荐；含点赞/收藏/评论交互与登录拦截）、`app/middleware/auth.ts`
  - 交付（mock 接口）：`user/current.get`、`article/like.post`、`article/collect.post`、`article/recommend.get`、`comment/publish.post`；`server/utils/resp.ts#fail` 改为泛型，使失败响应可匹配任意 `ApiResp<T>` 返回类型
  - 占位登录取舍：阶段 4 的登录为演示实现（`/api/user/current` 固定返回首个 mock 用户），未登录点赞/收藏/评论时由 `loginRequired` 唤起 `BaseModal`，可「一键演示登录」；阶段 5 替换为账号密码登录 + token 鉴权
  - `pnpm lint` ✅（0 warning / 0 error）· `pnpm typecheck` ✅（exit 0）· `pnpm build` ✅（Client 512.08 kB / Nitro 2.47 MB）
  - SSR 冒烟（preview:3200）：`/`、`/article/article_1`、`/article/article_2` 均 **HTTP 200**；`/article/nope_404` 走「文章不存在」兜底页（HTTP 200）；详情页直出 `.jj-markdown` 正文、5 个 `<h2>` 锚点、`#为什么选择-低代码` 等目录项与标题 id 一一对应、`hljs` 高亮类名、`相关推荐` 与评论区块；`<title>` = `从 0 到 1 搭建 低代码 项目实战 - 掘金`，`description` 取 `brief` ✅
  - 接口冒烟：`GET /api/user/current`、`POST /api/article/like`、`POST /api/article/collect`、`GET /api/article/recommend?id=`、`POST /api/comment/publish` 均 `err_no: 0` 且返回体符合共享类型 ✅
- **决策（用户确认）**：**跳过阶段 5 用户体系**，走「先展示、后体系」路线——后续模块优先做纯展示与交互功能，登录/真实数据留待部署方案确定后再定；现有「一键演示登录」弹窗保留，点赞/收藏/评论等交互照常可演示。
- **阶段 6 已完成（6.1 ~ 6.2；6.3 暂缓）**，验证结论：
  - 交付：`usePinFeed`（`useAsyncData('pin-feed')` 首屏 + `useInfiniteScroll` 游标追加 + 「加载更多」兜底）、`PinCard` / `PinList` + 骨架屏、`pages/pins/index.vue`（`default` 布局，复用首页侧栏）；`server/api/pin/like.post.ts`、`usePinDetail`（`Promise.all` 并行发起详情 + 评论两处 `useAsyncData`，含点赞 / 评论 / 登录拦截）、`PinActions`、`pages/pin/[id].vue`（`article` 布局 + 动态 SEO meta + 演示登录弹窗）；评论组件（`CommentEditor` / `CommentList` / `CommentItem`）按 `targetType: 'pin'` 直接复用
  - 类型：`shared/types/pin.ts` 新增 `PinLikeResult` 并在 `index.ts` 汇总导出
  - 路由说明：沸点列表落在 `pages/pins/index.vue`（而非 `pages/pins.vue`），为后续 6.3 `/pins/publish` 预留目录层级，避免 `pins.vue` 与 `pins/` 目录冲突
  - `pnpm lint` ✅（0 warning / 0 error）· `pnpm typecheck` ✅（exit 0）· `pnpm build` ✅（Client 525.84 kB / Nitro 2.51 MB）
  - SSR 冒烟（preview:3300）：`/`、`/pins`、`/pin/pin_1`、`/pin/pin_2` 均 **HTTP 200**；`/pin/nope_404` 走「沸点不存在」兜底页（HTTP 200）；`/pins` 直出 **10 张沸点卡**、`__NUXT__` 载荷含 `pin-feed`；`/pin/pin_1` 直出标题 `沸点 - 沉默的前端菜鸟 - 掘金`、正文/话题 `#React`、评论编辑器与 `pin-comments` 区块、载荷 key `pin-detail:pin_1` ✅
  - 接口冒烟：`GET /api/pin/list?limit=3`、`GET /api/comment/list?targetType=pin&targetId=pin_1`、`POST /api/pin/like`（`{"id":"pin_1"}` → `liked: true` / `likeCount: 147`）均 `err_no: 0` ✅
- **已知取舍（Nuxt 固有行为）**：`server/mock` 与 `shared/types` 下 `index.ts` 汇总导出 + 领域文件导出会被 Nuxt 自动扫描（`nuxt/dist/index.mjs#L9042` 把 `shared/types` 加入自动导入目录），产生约 20 条 `Duplicated imports` **警告**。因同名类型解析结果完全一致（`index.ts` 仅再导出领域文件），**不影响 lint / typecheck / build 退出码**，且 AGENTS.md §4.1 要求 `index.ts` 汇总导出，故**保留该行为、不作规避**（如需消音只能关闭自动导入扫描，代价过大）。
- **环境已固化**：Node `24.11.0`（`.nvmrc` + `package.json#engines`）；pnpm `10.33.0`（`package.json#packageManager`）。执行任何命令前需先 `nvm use`——Node 20 会让 ESLint 10 因缺少 `Object.groupBy` 直接崩溃。
- **依赖偏离说明**：`typescript` 固定 `^5.9`（TS 7 超出 vue-tsc / @typescript-eslint 的 peer 范围）；补充 `cssnano` 消除 Nuxt PostCSS 构建告警。
- **环境事件（需知悉）**：`vite-plus` 于本次自动把 pnpm 由 `10.33.0` 升到 `12.23.0`，触发"store 不一致 → 重建 node_modules"并撞上 pnpm 12 默认的 `minimumReleaseAge`（24h）供应链策略，导致 `node_modules` 一度被清空。已通过 `packageManager: pnpm@10.33.0` 固定版本并用 `pnpm install --frozen-lockfile` 恢复，锁文件未改动。
- **已推翻（2026-11-24 审查加固）**：原「暂不安装 `@iconify-json/lucide`、图标走 Iconify 在线 API」的取舍已作废——已安装 `@iconify-json/lucide`（dev）并把 `@nuxt/icon` 配置为 `mode: 'svg'` + `serverBundle: 'local'`，SSR 首页直出 40 个内联 `<svg>`，不再依赖在线 API。详见 [整体审查后的补充与优化](./2026-11-24-review-hardening.md)。
- 备注：`agent.md` 采用社区通用大写命名 `AGENTS.md`（macOS 文件系统不区分大小写）。
- 待办：阶段 5（用户体系）已由用户决定**暂缓**；阶段 6 剩余 6.3 依赖登录同样暂缓；阶段 8 已完成；阶段 9 已完成（9.1 ~ 9.5）；**阶段 10（收尾）10.1 ~ 10.4 已全部完成，计划内全部可执行步骤收尾完毕**。
- **阶段 7 已完成（7.0 ~ 7.5）**，验证结论：
  - 交付（编辑器）：依赖引入 `bytemd` / `@bytemd/vue-next` / `@bytemd/plugin-gfm` / `@bytemd/plugin-highlight` 并在 `AGENTS.md` 备案；`nuxt.config.ts` 引入 `bytemd/dist/index.css`，`main.css` 新增 `@layer components` 主题适配（`.jj-editor .bytemd` 高度/描边/暗色反相）
  - 交付（前端）：`layouts/editor.vue`（精简顶栏 + 全屏无侧栏）、`pages/editor/index.vue`、`pages/editor/drafts.vue`、`pages/editor/draft/[id].vue`、`pages/creator/index.vue`；组件 `editor/Workspace.vue`（ByteMD `<ClientOnly>` + gfm/highlight + 内联中文 locale + 双栏预览）、`editor/TitleBar.vue`（标题/字数/存草稿/发布）、`editor/PublishPanel.vue`（分类/标签/封面/摘要）、`editor/Form.vue`（组合入口 + 发布设置弹窗 + 演示登录弹窗）、`editor/DraftList.vue`（草稿箱与创作中心共用）、`creator/CreatorOverview.vue`（4 张统计卡 + 近 7 日阅读量柱状图）、`creator/CreatorContentList.vue`（内容管理列表）
  - 交付（状态 / 组合式）：`stores/draft.ts`（`useLocalStorage('jj-drafts')` 持久化 + 增删改查）、`useDraft`、`useEditor`（表单聚合 + debounce 2s 自动保存 + `saveNow` + 发布 + `loginRequired` 演示登录拦截）、`useCreator`（`Promise.all` 并行 `creator-overview` + `creator-contents`，游标追加）
  - 交付（mock 接口）：`server/api/article/publish.post.ts`（校验标题/正文，分类兜底，`deriveBrief` 从 Markdown 提取摘要，写入内存 db）、`server/api/creator/overview.get.ts`（由当前用户文章确定性推导统计与近 7 日趋势）、`server/api/creator/contents.get.ts`（当前用户文章游标分页）
  - 组件命名修正：因 `components` 配置 `pathPrefix: true`，将 `editor/EditorForm.vue` 重命名为 `editor/Form.vue`（→ `EditorForm`），删除早期误命名的 `Editor*.vue` 重复文件；`EditorTitleBar` / `EditorWorkspace` / `EditorPublishPanel` 分别由 `TitleBar.vue` / `Workspace.vue` / `PublishPanel.vue` 提供
  - 连带改动：`app/utils/format.ts` 新增 `formatDateTime`（本地草稿等以真实时间为准的 `MM-DD HH:mm`）；`AppHeader` 创作者中心按钮接入 `/creator`
  - 踩坑与修复：`@bytemd/vue-next` 的 `d.ts` 把组件导出声明成了类型（`DefineComponent`），`verbatimModuleSyntax` 下无法作为值导入（TS1484）；改为 `import * as bytemdVue` 后按运行时导出取回 `Editor` 组件引用
  - `pnpm lint` ✅（0 warning / 0 error）· `pnpm typecheck` ✅（exit 0）· `pnpm build` ✅（Client 2.11 MB / gzip 705.82 kB · Nitro 6.69 MB；ByteMD 仅随编辑器路由懒加载）
  - SSR 冒烟（preview:3400）：`/editor`、`/editor/drafts`、`/creator` 均 **HTTP 200**；`/editor` 直出标题栏（`输入文章标题…`、`存草稿`、`发布`、`草稿箱`），ByteMD 走 `<ClientOnly>` 兜底（SSR 无 `bytemd-toolbar`/`bytemd-body`，避免水合不一致）；`/creator` 直出 `数据概览/内容管理/草稿列表` Tab、统计卡与 `近 7 日阅读量`、内容列表文章标题，`__NUXT__` 载荷含 `creator-overview` / `creator-contents` ✅
  - 接口冒烟：`GET /api/creator/overview`（`totalView: 50082` + `viewSeries` 7 点 + `trends`）、`GET /api/creator/contents?limit=2`（游标 `cursor: "2"` / `hasMore: true`）、`POST /api/article/publish`（`{"title":"测试发布","content":"# 标题\n\n正文内容"}` → `id: article_new_1`，摘要自动生成）、`POST` 空标题 → `err_no: 400 文章标题不能为空` ✅
- **部署 + SQLite 持久化 + 登录真实化已完成**（详见 [部署计划](./2026-11-24-deploy-and-auth.md)），验证结论：
  - **SQLite 持久化层**：新增 `server/db/index.ts`（Node 24 内置 `node:sqlite`，零原生依赖），建表 `users` / `articles` / `pins` / `comments` / `article_likes` / `article_collects` / `pin_likes` / `tags`；`server/mock/seed.ts` 重构为纯数据生成函数，空库自动灌入；17 个接口从内存 `db` 改查 SQLite，重启服务数据不丢
  - **登录真实化**：`server/middleware/auth.ts` 解析 JWT Cookie → `event.context.user`；`/api/auth/login` 演示账号一键登录签发 JWT（HttpOnly, SameSite=Lax, 7d）；`/api/auth/logout` 清除 Cookie；交互接口（点赞/收藏/评论/发布）未登录返回 401
  - **前端对接**：`app/stores/user.ts` 移除客户端 cookie 改内存态；`app/composables/useAuth.ts` 对接 `/api/auth/login` 和 `/api/auth/logout`；`app/plugins/auth.ts` SSR 时拉取 `/api/user/current` 恢复登录态
  - **ECS 部署**：Docker 多阶段构建（`node:24-alpine`），`docker-compose.yml` 暴露 `3000:3000`，volume `./data:/app/data` 持久化 SQLite，日志轮转 10MB×3，JWT_SECRET 随机生成
  - **公网验证通过**：http://121.43.208.113:3000 —— 文章列表 API 正常、登录签发 JWT Cookie、点赞切换正确、首页 SSR 渲染 `<title>掘金 - 一个帮助开发者成长的社区</title>`
- **阶段 8 已完成（8.1 ~ 8.4）**，验证结论：
  - 交付（类型 / 数据层）：`shared/types/book.ts`（`BookSummary` / `BookSection` / `BookDetail`）、`shared/types/search.ts`（`SearchItem` 联合类型 + `SearchType`）、`shared/types/tag.ts` 新增 `TagDetail`；`shared/constants/search.ts`（`SEARCH_TYPES` 分类 Tab / `DEFAULT_SEARCH_TYPE` / `isSearchType`）；`server/mock/seed.ts` 新增 10 本小册种子（`BOOK_SEEDS` / `generateBooks`）；`server/db/index.ts` 新增 `books` 表与 `listBooks` / `getBookById`、`getTagByName` / `listArticlesByTag` / `listTopArticles`、`searchArticles` / `searchUsers` / `searchTags` / `searchBooks` 仓储（老库「只补灌小册」兼容种子逻辑）
  - 交付（接口）：`GET /api/search`（按 `q` + `type` 聚合文章/用户/标签/小册结果后统一游标分页）、`GET /api/tag/[tag]`（标签信息 + 标签下文章流）、`GET /api/rank/article`（阅读榜前 10）、`GET /api/book/list`、`GET /api/book/[id]`
  - 交付（前端）：`useSearch`（关键字/分类与 URL query 双向同步 + 防抖后取数 + 游标追加）、`useTagDetail`、`useRank`（`Promise.all` 并行作者榜 + 文章榜）、`useBookList`、`useBookDetail`；组件 `layout/AppSearch.vue`（400ms 防抖，站内原地 `replace` query、站外 `push` 跳转 `/search`）、`search/ResultList.vue`（按 `type` 区分渲染，文章复用 `ArticleCard`）、`book/Card.vue`、`rank/AuthorList.vue`、`rank/ArticleList.vue`；页面 `search.vue`、`tag/[tag].vue`、`rank/index.vue`、`books/index.vue`、`book/[id].vue`（`article` 布局 + 动态 SEO meta + 不存在兜底）
  - 连带改动：`AppHeader` 占位搜索框替换为 `AppSearch`，导航项由占位的「课程/商城」改为可用的「小册 `/books`」「排行榜 `/rank`」；`AppSidebar` 热门话题标签接入 `/tag/[name]`；`utils/format.ts` 新增 `formatPrice`（分 → `¥xx.xx`，0 显示「免费」）
  - 取舍说明：用户主页（阶段 5.3）尚未实现，搜索结果中的「用户」项以展示态呈现（头像/昵称/简介 + 关注按钮），未做跳转以避免死链
  - `pnpm lint` ✅（0 warning / 0 error）· `pnpm typecheck` ✅（exit 0，仅既有 `Duplicated imports` 警告）· `pnpm build` ✅（Client 2.13 MB / gzip 717.05 kB · Server 678.07 kB · Nitro 6.93 MB）
  - SSR 冒烟（node .output，:3500）：`/search?q=前端`、`/tag/前端`、`/rank`、`/books`、`/book/book_1` 均 **HTTP 200** 且标题正确；`/book/nope_404`、`/tag/nope_404` 走兜底页（HTTP 200）；搜索结果直出 `/article/article_*` 链接、标签页直出「N 篇文章 / N 人关注」、排行榜直出「作者榜/文章榜/掘力值」、小册详情直出「目录/已完更/立即购买」；`__NUXT__` 载荷含 `search:*` / `tag-detail:*` / `rank-author` / `rank-article` / `book-list` / `book-detail:book_1`；首页头部含 `/books`、`/rank` 导航与搜索输入框，侧栏热门话题 `href="/tag/*"` ✅
  - 接口冒烟：`GET /api/search?q=低代码&type=all&limit=3`、`GET /api/search?q=前端&type=tag`、`GET /api/book/list?limit=2`、`GET /api/book/book_1`、`GET /api/rank/article`、`GET /api/tag/前端?limit=2` 均 `err_no: 0`，游标 `hasMore/cursor` 正常 ✅
- **阶段 9 已完成（9.1 ~ 9.5）**，验证结论：
  - 交付（类型 / 常量）：`shared/types/notification.ts`、`shared/types/collection.ts`；`shared/constants/notification.ts`（`NOTIFICATION_TABS` / `DEFAULT_NOTIFICATION_TAB` / `isNotificationTab` / `getNotificationTabName` / `emptyNotificationUnread`）
  - 交付（数据层）：`server/mock/seed.ts` 新增 `NOTIFICATION_PER_USER = 16` 的消息种子（赞/评论/@ 优先指向收件人自己的文章，`system` 无 actor，约 45% 生成为未读）与每人 3~5 本收藏集的种子（每本去重收录 6~18 篇）；`server/db/index.ts` 新增 `notifications` / `collections` / `collection_articles` 三表与 `listNotifications` / `countUnreadByTab` / `markNotificationsRead` / `listCollections` / `getCollectionById` 仓储（未登录或非本人收藏集返回 `null`）；种子守卫扩展为「各表 count 为 0 才补灌」，兼容老库
  - 交付（接口）：`GET /api/notification/list`（`tab` 校验 + 回退默认分类 + 游标分页，未登录返回空页）、`GET /api/notification/unread`（未登录返回 `emptyNotificationUnread()`）、`POST /api/notification/read`（未登录 401，返回最新未读统计）、`GET /api/collection/list`、`GET /api/collection/[id]`
  - 交付（前端）：`useNotification`（Tab 与 URL query 同步 + 游标追加 + 全部已读）、`useNotificationSummary`、`useCollectionList`、`useCollectionDetail`；组件 `base/Tabs.vue` 增加 `badge`、`common/LoginGate.vue`（一键演示登录门）、`notification/List.vue`、`collection/Card.vue`；页面 `pages/notification/index.vue`、`pages/collection/index.vue`、`pages/collection/[id].vue`；`AppHeader` 新增「收藏集」导航项，铃铛改为 `NuxtLink → /notification` 并叠加未读角标（> 99 显示 `99+`）
  - **踩坑与修复 1（登录门 emit 被丢弃）**：登录成功后父级 `v-if="!isLoggedIn"` 立即卸载 `LoginGate`，而 Vue 的 `emit` 在实例已卸载时会直接 return，导致「登录后列表仍为空」。修复：登录门不再 `emit`，改由页面 `watch(isLoggedIn)` 触发 `refresh()`（通知页同时刷新未读统计），顺带修复了「从头部登录后页面数据不刷新」的情况。
  - **踩坑与修复 2（SSR 拿不到登录态）**：`useRequest` 原先直接用全局 `$fetch` 请求内部接口，SSR 下不会带 Cookie，导致「已登录用户刷新登录态页面仍看到登录门 / 头部不显示昵称」。修复：`useRequest` 在 `import.meta.server` 时改用 `useRequestFetch()` 透传入站 Cookie。
  - `pnpm lint` ✅（0 warning / 0 error；修复 `useCollectionDetail` 的 `no-shadow` 与 `seed.ts` 的 `no-useless-assignment`）· `pnpm typecheck` ✅（exit 0，仅既有 `Duplicated imports` 警告）· `pnpm build` ✅（Client 2.15 MB / gzip 724.70 kB · Server 712.38 kB · Nitro 6.99 MB）
  - SSR 冒烟（preview:3100）：`/notification`、`/collection`、`/collection/collection_1`、`/collection/nope_404` 均 **HTTP 200**；带 Cookie 时 `/notification` 直出头部昵称、铃铛角标 `9`、消息条目（`收藏了你的文章《用 Rust 重构之后的几点思考》` 等）与 Tab 角标，`/collection` 直出收藏集卡片（`我的技术成长 / 12 篇`）；不带 Cookie 时直出「一键演示登录」门；回归复核 `/`、`/pins`、`/books`、`/rank`、`/article/article_11`、`/book/book_1`、`/creator`、`/search?q=Node` 均 **HTTP 200**
  - 接口冒烟：未登录 `GET /api/notification/list`、`/api/notification/unread`、`/api/collection/list` 均返回空页/零统计；登录后 `GET /api/notification/unread` = `{ total: 9, byTab: { like: 3, comment: 2, follow: 1, system: 3 } }`，`GET /api/notification/list?tab=like`、`GET /api/collection/list`、`GET /api/collection/collection_1` 正常，`GET /api/collection/nope_404` → `data: null`，`POST /api/notification/read`（先 `tab=like` 后全量）逐级归零 ✅
  - 浏览器交互冒烟（Chrome DevTools MCP，纯净 profile）：`/collection` 点「一键演示登录」→ 头部显示昵称、收藏集卡片即时渲染；`/notification` 直出角标 `9` + Tab 角标（评论 2 / 关注 1 / 系统 3）+ 未读红点，点「全部已读」→ 头部与 Tab 角标、未读红点、按钮同时消失；`/collection/collection_999` 走「收藏集不存在」兜底；控制台无 error / warn ✅
- **阶段 10 · 收尾（10.1 ~ 10.4 全部完成）**，当前进度：
  - 10.1 响应式适配：新增 `shared/constants/nav.ts`（`NAV_ITEMS`）供头部与抽屉复用；`app/stores/app.ts` 增加 `mobileNavOpen` 与开关方法；新增 `app/components/layout/AppNavDrawer.vue`（Teleport 抽屉 + `useScrollLock` + 路由变化自动收起 + 登录态页脚）；`AppHeader` 重写为「`lg` 以上横向导航 / 以下汉堡」；`pages/article/[id].vue` 收紧移动端内边距与标题字号
  - 10.2 SEO / meta / sitemap：新增依赖 `@nuxtjs/sitemap@9.1.0`（`--save-exact`，AGENTS.md 已备案）；新增 `server/api/_sitemap-urls.ts`（`defineSitemapEventHandler` 汇总文章 / 沸点 / 小册 / 标签动态 URL）与 `app/composables/usePageSeo.ts`（统一 title/description/og/twitter + canonical），16 个页面改用 `usePageSeo`；`nuxt.config.ts` 补 `site`/`sitemap`/`runtimeConfig.public.siteUrl` 与默认 meta（robots、og:site_name、og:type、twitter:card）；`public/robots.txt` 更新并指向 sitemap
  - 10.3 全局错误处理：新增 `app/error.vue`（404/500 兜底页，`clearError` 回首页）；新增 `app/composables/useToast.ts` + `app/components/common/Toast.vue`（全局轻提示，SSR 阶段跳过以规避跨请求状态污染）；`useRequest` 在业务失败（`err_no !== 0`）与网络异常时统一 `pushToast`（网络异常只给通用文案 `网络异常，请稍后重试`，不透出 ofetch 技术细节），三个 layout 均挂 `<CommonToast />`
  - 10.4 构建校验与性能自查：`AppAvatar`（`base/Avatar.vue`）补 `loading="lazy"`，使列表 / 详情页头像全部懒加载（首页 20/20 张图均带 `loading="lazy"`）
  - 验证（生产构建 + preview:4321，`127.0.0.1` 显式指定以绕开本机旧 dev server 占用的 `[::1]:3000`）：
    - `pnpm lint` ✅（0 warning / 0 error，152 files）· `pnpm typecheck` ✅（exit 0，仅既有 `Duplicated imports` 与 devtools `addCustomTab` deprecated 告警）· `pnpm build` ✅（Client 2.15 MB / gzip 723.90 kB · Server 707.67 kB · Nitro 7.45 MB）
    - SSR 冒烟：`/`、`/pins`、`/books`、`/rank`、`/search?q=Node`、`/article/article_1`、`/article/article_11`、`/pin/pin_1`、`/book/book_1`、`/tag/Node`、`/notification`、`/collection`、`/creator`、`/editor`、`/editor/drafts`、`/sitemap.xml`、`/robots.txt` 均 **HTTP 200**；`/nope-404` → **HTTP 404** 且直出 `404 / 页面走丢了 / 返回首页`；`/sitemap.xml` 共 **211** 条 URL
    - SEO：文章页直出 `canonical=http://121.43.208.113:3000/article/article_1`、`og:title` 为文章标题、`description` 为文章摘要 ✅
    - 性能自查：首屏 HTML `/` 60.5 KB / `/article/article_1` 50.8 KB / `/pins` 56.3 KB / `/books` 60.2 KB；SSR TTFB ≈ 4.7 ms；客户端最大 chunk 880 KB（含 Vue 运行时）、次大 628 KB（ByteMD 编辑器，按路由懒加载）、另 252 KB / 140 KB；图片懒加载首页 **20/20** ✅
    - 浏览器交互冒烟（Chrome DevTools MCP，纯净 profile，指向生产 preview）：`390×844` 下头部横向导航隐藏（可见项 0）、汉堡按钮可见，点击后抽屉直出 `掘金 / 首页 / 沸点 / 小册 / 收藏集 / 排行榜 / 创作者中心 / 登录`，`body` 滚动锁生效，点遮罩可关闭；`1280×900` 下横向导航 5 项恢复可见、汉堡隐藏、右栏可见；劫持 `fetch` 制造接口失败后点击分类 Tab，Toast 弹出 `网络异常，请稍后重试`；控制台无 hydration / Vue 运行时报错 ✅
- **阶段 5.1 尾项 / 5.3 / 5.4 / 6.3 已完成**（落地计划见 [用户体系（主页 / 设置 / 登录注册）+ 发布沸点](./2026-11-24-user-system-and-pin-publish.md)，该计划阶段 0 ~ 6 已全部勾选）：
  - **登录真实化（5.1 尾项）**：`POST /api/auth/register`（用户名 4~20 位 + 昵称 + 密码 ≥ 6，`node:crypto` scrypt 哈希落库）、`POST /api/auth/password`（校验旧密码）、`app/pages/login.vue` / `register.vue`；`/api/auth/login` 兼容「带账号密码校验」与「无 body 一键演示登录」两种模式，演示登录保留
  - **用户主页（5.3）**：`GET /api/user/[id]` 返回 `UserProfile`（含 `following`），新增 `GET /api/user/[id]/{articles,pins,collections,likes,following}` 游标分页接口；`POST /api/user/follow` 关注/取关；`app/pages/user/[id].vue` 五 Tab（文章/沸点/收藏集/赞过/关注），Tab 与 URL query 双向同步
  - **关注体系**：新增 `follows` 表 + `toggleFollow`，首页「关注」流按真实关注关系过滤（`/api/article/feed?category=follow`），未登录显示登录门；文章详情 / 沸点详情作者位、搜索结果用户项统一走 `UserFollowButton`（`useFollow` + 登录拦截）
  - **个人设置（5.4）**：`POST /api/user/profile`（昵称/头像/职位/公司/简介/邮箱，保存后同步登录态昵称头像）；`app/pages/settings/profile.vue`（资料编辑）、`app/pages/settings/account.vue`（掘金号/注册时间/修改密码/退出登录，手机绑定「暂不支持」占位）；`app/components/settings/Nav.vue` 侧栏导航；两页均挂 `middleware/auth`
  - **发布沸点（6.3）**：`POST /api/pin/publish`（正文必填、图片 ≤ 9、话题 ≤ 5、未登录 401）；`app/components/pin/PublishForm.vue`（正文 + 字数统计、图片 URL 多行 + 预览 + 删除、话题推荐选择 / 自由输入）；`app/pages/pins/publish.vue`（挂 `middleware/auth`，发布成功跳 `/pin/[id]`）；入口：头部「发沸点」按钮 + 抽屉项 + 沸点列表页发布入口
  - 连带改动：`nuxt.config.ts#sitemap.exclude` 与 `public/robots.txt` 纳入 `/settings`、`/settings/**`、`/pins/publish`
  - 验证（preview:3100）：`pnpm lint` ✅（0 warning / 0 error）· `pnpm typecheck` ✅（exit 0）· `pnpm build` ✅（Client 2.20 MB / gzip 741.73 kB · Nitro 7.57 MB）；接口冒烟（注册→登录→关注→发沸点→改资料→改密码）全 `err_no: 0`；私有页未登录 302 → `/login?redirect=…`，带 Cookie 200 ✅
- **计划内全部阶段（0 ~ 10）已完成**：阶段 8（搜索/标签/排行/小册）、阶段 9（消息中心/收藏集）、阶段 10（收尾）与本次用户体系收尾均已落地，无遗留待办。
- **2026-11-24 整体审查加固（已完成，详见 [整体审查后的补充与优化](./2026-11-24-review-hardening.md)）**：
  - ① 安全：`server/utils/auth.ts` 生产缺 `JWT_SECRET` 直接抛错 + 新增 `server/plugins/jwt-guard.ts`（启动即退出）、`docker-compose.yml`/`docs/deploy.md`/`README.md` 改为**强制注入** `JWT_SECRET`、登录 Cookie 按站点协议条件加 `secure`
  - ② 重构：`server/db/index.ts`（原 1644 行）拆为 `schema.ts` + `repositories/` 9 个领域仓储，`index.ts` 保留汇总 re-export，`~~/server/db` 导入路径与调用方不变
  - ③ 图标：安装本地图标集并将 `@nuxt/icon` 配置为 `mode: 'svg'` + `serverBundle: 'local'`（见上「已推翻」条目）
  - ④ 工程：新增 `vitest.config.ts` + `tests/**`（34 例纯函数单测）与 `.github/workflows/ci.yml`（`lint → typecheck → test → build`）
  - 验证：`pnpm lint` 0 warning / 0 error（195 files）· `pnpm typecheck` exit 0 · `pnpm test` 34/34 · `pnpm build` 成功 · 无密钥 + `NODE_ENV=production` 启动 exit 1 · 13 个接口冒烟 `err_no: 0` · SSR 首页 40 个内联 SVG
  - 本次同步更新文档：`README.md`、`AGENTS.md`、`docs/deploy.md`、`docs/plans/*.md`
