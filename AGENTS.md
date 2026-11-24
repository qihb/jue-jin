# AGENTS.md · 掘金复刻项目架构与协作规范

> 本文件是本仓库的**唯一架构规范来源**。所有人工开发与 AI 代理在本仓库内的工作，均须遵守以下约束。规范与实现冲突时，以本文件为准；确需突破须先修改本文件并说明原因。

---

## 1. 项目定位

用 **Nuxt 4** 复刻掘金社区（juejin.cn）核心功能，产出一个 SSR 可用、可交互、可演示的完整前端站点。数据由 Nitro 内置 mock 接口提供，后续可平滑替换为真实后端。

---

## 2. 技术栈基线（禁止随意替换）

| 分类 | 选型 | 版本约束 |
| --- | --- | --- |
| 框架 | Nuxt | 4.x（Vue 3.5+ / Nitro 2） |
| 语言 | TypeScript | strict 模式，禁止裸 `any` |
| 样式 | Tailwind CSS | v4（`@tailwindcss/vite`），token 走 CSS 变量 |
| 图标 | @nuxt/icon + Iconify | 按需引入 |
| 工具库 | @vueuse/nuxt | 优先复用，避免自造轮子 |
| 状态 | Pinia | `@pinia/nuxt` |
| 规范 | @nuxt/eslint + Prettier + Oxlint | 提交前必过 |
| 包管理 | pnpm | 锁定版本，禁用 npm/yarn 生成 lockfile |

> **运行环境**：Node `^22.21.0 || ^24.11.0 || >=26.0.0`（见 `.nvmrc`，当前固定 `24.11.0`）。
> Node 20 及以下会导致 `eslint` 启动崩溃（缺少 `Object.groupBy`），务必先 `nvm use` 再执行任何命令。

---

## 3. 目录职责边界（强约束）

```text
app/        前端全部代码（Nuxt 4 app 目录分层）
server/     Nitro 服务端：mock 接口与数据源
shared/     client 与 server 共享的类型、常量、纯函数
docs/       计划与设计文档
public/     静态资源（图标、图片、favicon）
```

**依赖方向（单向，不可逆向）**：

```text
app  ──┐
       ├──► shared
server ┘
```

- `app/` 与 `server/` **禁止**互相 import。
- 共享内容**只能**放 `shared/`。
- `shared/` 内**禁止**出现任何 Nuxt/Vue 运行时 API（保持纯净、可被两端引用）。

---

## 4. 编码规范

### 4.1 TypeScript
- 严格模式，禁止 `any`；无法确定类型用 `unknown` 再收窄。
- 所有业务实体类型统一放 `shared/types/`，按领域拆分文件（`user.ts` / `article.ts` / `pin.ts` …）并在 `index.ts` 汇总导出。
- 接口请求/响应类型必须显式声明，禁止依赖隐式推断的 `any`。

### 4.2 命名
- 组件：`PascalCase`，**文件名与组件名一致**；页面路由文件遵循 Nuxt 约定（`[id].vue`）。
- composable：`use` 开头 + `camelCase`（`useArticleFeed`）。
- store：`camelCase` + `useXxxStore`（`useUserStore`）。
- 常量：`SCREAMING_SNAKE_CASE`。
- 类型/接口：`PascalCase`，接口不加 `I` 前缀。

### 4.3 组件
- **组件只负责展示与交互，禁止直连接口**。数据通过 `props` / `composables` 注入。
- 单文件组件顺序：`<script setup>` → `<template>` → `<style>`（尽量不用 `<style>`）。
- 可复用组件放 `app/components/` 对应分类目录；**只被单一页面使用的组件**就近放在该页面同级目录或 `pages/**/components/`。
- props 必须带类型；事件用 `defineEmits` 显式声明。

### 4.4 样式
- 只使用 Tailwind 原子类 + `@theme` 定义的 token。
- **禁止魔法色值**（如 `#1e80ff` 直接写进组件）——统一使用语义变量：`--color-jj-primary`、`--color-jj-text-1` 等。
- 复杂/重复样式用 `@apply` 收敛到组件类或 `base/` 组件，禁止大段复制粘贴 class 串。
- 响应式以移动端单栏、桌面端双栏（内容区 + 侧栏）为基准断点。

### 4.5 状态管理
- 仅**跨页面共享**的状态进 Pinia（登录态、主题、草稿）。
- 页面内局部状态用 `ref` / `reactive`，不得为了"统一"硬塞进 store。

### 4.6 数据请求
- 所有请求只允许出现在 `composables/` 或页面的 `useAsyncData` / `useFetch` 中。
- 统一走 `composables/useRequest` 封装，集中处理错误与响应体解包（`{ err_no, err_msg, data }`）。
- SSR 首屏数据优先用 `useAsyncData`；交互触发用封装后的 `$fetch`。

---

## 5. 服务端（mock）约定

- 接口统一响应体：
  ```ts
  interface ApiResp<T> { err_no: number; err_msg: string; data: T }
  ```
  （`err_no === 0` 表示成功）
- 分页统一使用 `limit` + `cursor` 游标分页，返回 `{ list, cursor, hasMore }`。
- 列表类接口必须支持分页，禁止一次性返回全量数据。
- mock 数据由 `server/mock/seed.ts` 生成，使用**固定随机种子**，保证 SSR 与 CSR 渲染结果一致（避免 hydration mismatch）。
- 接口文件命名遵循 Nuxt：`xxx.get.ts` / `xxx.post.ts`，路径即 `server/api/` 下的目录结构。

---

## 6. 路由与页面

- 使用文件路由，路由结构即目录结构，禁止手工维护路由表。
- 需登录的页面统一挂 `middleware/auth.ts`，不得在页面内散写判断跳转。
- 页面职责：取数 → 传给组件 → 组合展示；**页面内禁止写复杂业务逻辑**，抽到 composable。
- 页面标题与 meta 用 `useSeoMeta`，文章详情页必须设置动态 title/description。

---

## 7. Do & Don't

**Do**
- 新建功能前先看 `docs/plans/` 是否有对应计划，按阶段推进。
- 复用 `base/` 组件与 `@vueuse` 能力，避免重复造轮子。
- 破坏性变更前先更新本文件与计划文档。

**Don't**
- ❌ 组件内直接 `$fetch` / 写死接口地址。
- ❌ 跨层 import（`app` ⇄ `server`）。
- ❌ 组件内写魔法色值、魔法断点。
- ❌ 残留 `console.log`、注释掉的死代码、未使用变量。
- ❌ 引入未经确认的新依赖 / 新 UI 组件库。

---

## 8. 常用命令

```bash
pnpm dev          # 本地开发 http://localhost:3000
pnpm build        # 生产构建
pnpm preview      # 预览构建产物
pnpm lint         # ESLint 校验
pnpm lint:fix     # ESLint 自动修复
pnpm format       # Prettier 格式化
pnpm typecheck    # 类型检查（vue-tsc）
```

---

## 9. 提交前自检清单

- [ ] `pnpm lint` 与 `pnpm typecheck` 均通过
- [ ] 无 `any`、无 `console.log`、无未使用变量
- [ ] 颜色/间距全部走 token，无魔法值
- [ ] 请求只出现在 composable 或页面 `useAsyncData`
- [ ] 分页接口走游标分页，mock 数据 SSR/CSR 一致
- [ ] 新页面已接 `middleware/auth`（如需登录）并设置 SEO meta
- [ ] 相关计划文档中的步骤已勾选并更新「当前状态」
