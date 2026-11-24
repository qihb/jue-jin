# 整体审查后的补充与优化 · 落地计划

**目标**：针对全项目审查结论，落地「安全加固 / 拆分 db 大文件 / 补本地图标集 / 补测试与 CI」四类改进，不改变任何既有功能行为。
**技术栈 / 约束**：遵循 [AGENTS.md](../../AGENTS.md)；Nuxt 4 + Nitro + `node:sqlite`；pnpm `10.33.0`；Node `24.11.0`（执行前先 `nvm use`）。
**涉及文件**：

- 修改：`server/utils/auth.ts`、`docker-compose.yml`、`server/db/index.ts`、`package.json`、`nuxt.config.ts`
- 新增：`server/db/schema.ts`、`server/db/repositories/*.ts`、`vitest.config.ts`、`tests/**`、`.github/workflows/ci.yml`
- 依赖新增：`vitest`（dev）、`@iconify-json/lucide`（dev）

**关键决策（已确认）**：

- 安全加固：`NODE_ENV === 'production'` 且缺 `JWT_SECRET` 时**直接抛错退出**（副作用：本地 `pnpm preview` 需先设该环境变量）。
- 测试范围：**轻量纯函数单测**，引入 `vitest`（不引入 `@nuxt/test-utils`，不测 Nitro 接口 / SQLite 集成）。
- 文档同步：**本次不改** AGENTS.md / README / deploy.md（`docker-compose.yml` 的 `sed` 替换指引将在后续统一处理时同步）。
- db 拆分：`server/db/index.ts` 保留为**汇总 re-export**，保持 `~~/server/db` 导入路径不变，避免改动 20+ 处调用方。

**执行约定**：本文件仅为计划；由用户指定步骤后再执行，每完成一步勾选 `- [ ]` → `- [x]`。

---

## 阶段 1 · 安全加固

- [x] 1.1 `server/utils/auth.ts`：JWT 密钥改为惰性获取 `getSecretKey()`；当 `NODE_ENV === 'production'` 且未注入 `JWT_SECRET` 时抛出明确错误（含提示文案），否则回退开发密钥
- [x] 1.2 `server/utils/auth.ts`：Cookie 写入按站点协议条件加 `secure`（`siteUrl` 为 `https:` 时启用），当前 HTTP 部署行为不变
- [x] 1.3 `docker-compose.yml`：`JWT_SECRET=change-this-to-a-long-random-string` 改为 `${JWT_SECRET:?请在 .env 或环境变量中注入 JWT_SECRET}`，强制外部注入
- [x] 1.4 验证：无 `JWT_SECRET` + `NODE_ENV=production` 启动应报错；带 `JWT_SECRET` 正常登录/登出
- [x] 1.5 补充：新增 `server/plugins/jwt-guard.ts`（Nitro 启动插件调用 `assertJwtSecretConfigured()`），把「首次登录才 500」提前为「启动即退出」

## 阶段 2 · 拆分 db 大文件（纯重构，不改行为）

- [x] 2.1 抽出 `server/db/schema.ts`：建表 DDL 与「各表 count 为 0 才补灌」种子守卫
- [x] 2.2 按领域拆出 `server/db/repositories/`：`article.ts` / `pin.ts` / `user.ts` / `comment.ts` / `notification.ts` / `collection.ts` / `book.ts` / `tag.ts`（含 `search*`）
- [x] 2.3 `server/db/index.ts` 改为汇总导出（`export * from './schema'` + 各仓储），保留 `db` 实例导出与 `~~/server/db` 导入路径
- [x] 2.4 验证：`pnpm lint` / `pnpm typecheck` / `pnpm build` + 关键接口冒烟（文章流 / 详情 / 登录 / 通知 / 收藏集）与重构前一致

## 阶段 3 · 本地图标集

- [x] 3.1 安装 `@iconify-json/lucide`（devDependency，锁定版本）
- [x] 3.2 验证：生产 `preview` 下 SSR HTML 含内联 icon SVG（不再依赖在线 Iconify API），首页/头部图标正常显示

## 阶段 4 · 测试与 CI

- [x] 4.1 安装 `vitest`，新增 `vitest.config.ts`（配置 `~~` / `~` 别名）与 `package.json#scripts.test`
- [x] 4.2 为纯函数补单测：`shared/constants/*`（类型守卫/枚举）、`app/utils/format.ts`、`app/utils/markdown.ts`（渲染 + TOC）、`server/utils/resp.ts`（游标分页边界）、`server/utils/password.ts`（哈希/校验）
- [x] 4.3 新增 `.github/workflows/ci.yml`：Node 24.11 + pnpm 10.33，依次跑 `lint` / `typecheck` / `test` / `build`
- [x] 4.4 验证：`pnpm test` 全绿；CI 工作流 YAML 语法有效

---

## 当前状态

- **四阶段（1~4）均已完成并通过验证。**
- 验证结论：
  - `pnpm lint` 0 warning / 0 error（195 files）；`pnpm typecheck` exit 0。
  - `pnpm test` 34 tests 全绿（format / markdown / resp / password / constants）。
  - `pnpm build` 成功（Client 2.20 MB · gzip 741.26 kB ｜ Server 775.73 kB ｜ Nitro 8.24 MB）。
  - 安全：无 `JWT_SECRET` + `NODE_ENV=production` → 启动 exit 1 并打印明确文案；带 `JWT_SECRET` → 首页/登录 HTTP 200，`Set-Cookie: jj-token ... HttpOnly; SameSite=Lax`。
  - 图标：SSR 首页直出 40 个内联 `<svg>`（`iconify_span=40`）。
  - 接口冒烟：13 个接口返回 `err_no: 0`，与重构前一致。
- 审查结论来源：2026-11-24 全项目代码审查（安全 / 可维护性 / 部署 / 性能四类）。
- **待跟进（本次未做）**：`docker-compose.yml` 已将 `JWT_SECRET` 改为强制注入，deploy.md / README 中「`sed` 替换默认值」的指引随之失效，需在后续统一更新文档时同步。
- 未纳入本次范围：`@nuxt/image` 图片优化、登录限流、HTTPS、手机号绑定、容器非 root 与 healthcheck（如需可另开步骤）。
