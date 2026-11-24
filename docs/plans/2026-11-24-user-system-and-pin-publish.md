# 用户体系（主页 / 设置 / 登录注册）+ 发布沸点 · 落地计划

**目标**：补齐主计划剩余 4 项——5.1 尾项「独立登录/注册页」、5.3 用户主页、5.4 个人设置、6.3 发布沸点；把登录从「演示一键登录」升级为真实账号密码，并落地真实关注关系。
**技术栈 / 约束**：遵循 [AGENTS.md](../../AGENTS.md)。数据层沿用 `node:sqlite` 仓储模式；请求统一走 `useRequest`，组件不直连接口；新增表 / 列须兼容线上已有 `data/juejin.db`（幂等迁移）。
**关键决策（用户已确认）**：
- 登录注册：**真实账号密码**（`node:crypto` scrypt 哈希，`users` 表新增 `password_hash`），并保留一键演示登录
- 关注体系：**落库为真实关注关系**（新增 `follows` 表），首页「关注」流按已关注作者过滤
- 沸点配图：**图片 URL 输入**（多张 + 预览），不做文件上传 / 对象存储
**执行约定**：本文件仅为计划；由用户指定步骤后再执行，每完成一步勾选 `- [ ]` → `- [x]`，并同步主计划勾选与「当前状态」。

---

## 阶段 0 · 数据层与共享类型（前置）

- [x] 0.1 `server/db/index.ts`：`users` 表新增 `password_hash`，新建 `follows` 表；用 `PRAGMA table_info` 做幂等迁移（老库自动补列，不动既有数据）
- [x] 0.2 仓储新增：`createUserWithPassword` / `getPasswordHash` / `updateUserPassword` / `updateUserProfile` / `createPin` / `listPinsByAuthor` / `listLikedArticles` / `listCollectionsByUser` / `listFollowings` / `toggleFollow`；`listArticles` 的 `follow` 流改为按关注关系过滤（未登录为空）；`getCollectionById` 去掉「仅本人」限制（收藏集公开可读）
- [x] 0.3 共享类型 / 常量：`shared/types/user.ts` 加 `UserProfile`、`UserProfileTab`；`shared/constants/user.ts`（`USER_PROFILE_TABS` / `PIN_CONTENT_MAX_LENGTH` / `PIN_IMAGE_MAX_COUNT` / `PIN_TOPIC_MAX_COUNT`）
- [x] 0.4 `server/utils/password.ts`：scrypt 哈希与校验（零新增依赖）

## 阶段 1 · 真实账号密码与登录 / 注册页

- [x] 1.1 `POST /api/auth/register`：用户名 4~20 位字母数字下划线、昵称、密码 ≥ 6、用户名唯一 → 建号并签发 JWT Cookie
- [x] 1.2 `POST /api/auth/login` 扩展：带 `username`/`password` 走密码校验；无 body 时保持原「一键演示登录」（兼容现有调用）
- [x] 1.3 `POST /api/auth/password`：登录后修改密码（校验旧密码）
- [x] 1.4 `app/composables/useAuth.ts` 增加 `loginWithPassword` / `register` / `changePassword`
- [x] 1.5 `app/pages/login.vue`：账号密码表单 + 一键演示登录 + 去注册；读 `redirect` query；已登录自动回跳
- [x] 1.6 `app/pages/register.vue`：注册表单（含确认密码），成功后自动登录并跳转
- [x] 1.7 头部 / 抽屉未登录按钮改为跳转 `/login`；各处「登录门」弹窗内保留一键演示登录

## 阶段 2 · 用户主页 `/user/[id]`

- [x] 2.1 接口：`GET /api/user/[id]` 改返回 `UserProfile`（含 `following`）；新增 `GET /api/user/[id]/{articles,pins,collections,likes,following}`（游标分页）
- [x] 2.2 `POST /api/user/follow`：关注 / 取关，返回 `FollowState`（未登录 401）
- [x] 2.3 组件：`app/components/user/ProfileCard.vue`（资料 + 掘力值 + 关注/粉丝/获赞 + 关注按钮）、`app/components/user/FollowingList.vue`
- [x] 2.4 `app/composables/useUserProfile.ts`：资料 + Tab 与 URL query 同步 + 各 Tab 游标分页 + 关注切换
- [x] 2.5 `app/pages/user/[id].vue`：Tab 文章 / 沸点 / 收藏 / 赞过 / 关注，复用 `ArticleCard` / `PinCard` / `CollectionCard`；不存在兜底页；SEO

## 阶段 3 · 关注接入既有展示位

- [x] 3.1 `app/composables/useFollow.ts`：关注态 + 切换 + 登录拦截（供多处复用）
- [x] 3.2 文章详情作者位 / 沸点详情「关注」按钮接真实关注
- [x] 3.3 搜索结果用户项改为可点击跳转 `/user/[id]`，关注按钮接真实关注（消除原「不跳转以免死链」的取舍）
- [x] 3.4 首页「关注」流：按已关注作者过滤；未登录显示登录门
- [x] 3.5 其他：头部头像接「我的主页」`/user/[id]`，并新增「设置」入口（阶段 1 已提前完成）
- [x] 3.6 取舍：标签页「关注」仍为展示态（无标签关注表，不在本次范围）

## 阶段 4 · 发布沸点 `/pins/publish`

- [x] 4.1 `POST /api/pin/publish`：正文必填、图片 ≤ 9、话题 ≤ 5，未登录 401 → 返回 `PinSummary`
- [x] 4.2 组件 `app/components/pin/PublishForm.vue`（正文 + 字数统计、图片 URL 多行 + 预览 + 删除、话题选择 / 自由输入）
- [x] 4.3 `app/composables/usePinPublish.ts` + `app/pages/pins/publish.vue`（挂 `middleware/auth`）；发布成功跳 `/pin/[id]`
- [x] 4.4 入口：头部「发沸点」按钮 + 抽屉项 + 沸点列表页发布入口

## 阶段 5 · 个人设置

- [x] 5.1 `POST /api/user/profile`：更新昵称 / 头像 / 职位 / 公司 / 简介 / 邮箱 → 返回更新后的 `User`，前端同步登录态昵称头像
- [x] 5.2 `app/components/settings/Nav.vue` + `app/pages/settings/profile.vue`、`app/pages/settings/account.vue`（均挂 `middleware/auth`）
- [x] 5.3 account 页：掘金号、注册时间、修改密码、退出登录；邮箱 / 手机绑定以「暂不支持」占位说明

## 阶段 6 · 联调与文档

- [x] 6.1 `pnpm lint` / `pnpm typecheck` / `pnpm build` 全通过
- [x] 6.2 冒烟：注册 → 登录 → 关注 → 主页五 Tab → 发沸点 → 改资料 / 改密码（SSR + 接口 + 浏览器）
- [x] 6.3 更新本计划 + 主计划（勾选 5.1 尾项 / 5.3 / 5.4 / 6.3 与「当前状态」）+ README 未完成清单

---

## 涉及文件

- **数据层**：`server/db/index.ts`（表 / 迁移 / 仓储）、`server/utils/password.ts`（新增）
- **接口新增**：`server/api/auth/register.post.ts`、`server/api/auth/password.post.ts`、`server/api/user/follow.post.ts`、`server/api/user/profile.post.ts`、`server/api/user/[id]/articles.get.ts`、`pins.get.ts`、`collections.get.ts`、`likes.get.ts`、`following.get.ts`、`server/api/pin/publish.post.ts`
- **接口改造**：`server/api/auth/login.post.ts`、`server/api/user/[id].get.ts`
- **共享层**：`shared/types/user.ts`、`shared/types/index.ts`、`shared/constants/user.ts`（新增）、`shared/constants/index.ts`
- **组件新增**：`app/components/user/ProfileCard.vue`、`user/FollowingList.vue`、`pin/PublishForm.vue`、`settings/Nav.vue`
- **页面新增**：`app/pages/login.vue`、`register.vue`、`user/[id].vue`、`pins/publish.vue`、`settings/profile.vue`、`settings/account.vue`
- **组合式新增**：`app/composables/useUserProfile.ts`、`useFollow.ts`、`usePinPublish.ts`
- **连带修改**：`app/composables/useAuth.ts`、`app/components/layout/AppHeader.vue`、`layout/AppNavDrawer.vue`、`components/search/ResultList.vue`、`pages/article/[id].vue`、`pages/pin/[id].vue`、`pages/pins/index.vue`、`app/middleware/auth.ts`（注释）、`README.md`

---

## 当前状态

**阶段 0 ~ 6 全部完成，计划内步骤已全部勾选。**

- 交付（数据层 / 共享层）：`users` 表新增 `password_hash`、新增 `follows` 表（`PRAGMA table_info` 幂等迁移）；仓储新增 `createUserWithPassword` / `getPasswordHash` / `updateUserPassword` / `updateUserProfile` / `createPin` / `listPinsByAuthor` / `listLikedArticles` / `listCollectionsByUser` / `listFollowings` / `toggleFollow`，`listArticles` 的 `follow` 流改为按关注关系过滤；`server/utils/password.ts`（`node:crypto` scrypt，格式 `salt:hash`）；共享类型新增 `UserProfile` / `UserProfileTab` / `FollowState` / `PinPublishPayload`，常量新增 `USER_PROFILE_TABS` / `PIN_CONTENT_MAX_LENGTH=500` / `PIN_IMAGE_MAX_COUNT=9` / `PIN_TOPIC_MAX_COUNT=5` / `PIN_TOPIC_SUGGESTIONS` / `NICKNAME_MAX_LENGTH` / `USER_DESCRIPTION_MAX_LENGTH` / `EMAIL_PATTERN`
- 交付（接口）：`POST /api/auth/register`、`POST /api/auth/password`、`POST /api/user/follow`、`POST /api/user/profile`、`POST /api/pin/publish`、`GET /api/user/[id]/{articles,pins,collections,likes,following}`；`/api/auth/login` 扩展为「带账号密码走校验 / 无 body 走一键演示登录」；`/api/user/[id]` 返回 `following`；`/api/search` 用户项返回 `following`
- 交付（前端）：`login.vue` / `register.vue`、`user/[id].vue`（五 Tab）、`pins/publish.vue`、`settings/profile.vue` / `settings/account.vue`；组件 `user/ProfileCard` / `user/FollowingList` / `user/FollowButton` / `pin/PublishForm` / `settings/Nav`；组合式 `useAuth`（`loginWithPassword` / `register` / `changePassword`）、`useUserProfile`、`useFollow`、`usePinPublish`、`useUserSettings`；首页「关注」流登录门 + 登录后刷新，文章/沸点详情与搜索结果用户项接入真实关注，头部头像接「我的主页」+ 新增「设置」入口，沸点列表页新增发布入口
- 验证结论：
  - `pnpm lint` ✅（0 warning / 0 error，179 files）· `pnpm typecheck` ✅（exit 0，仅既有 `Duplicated imports` 警告）· `pnpm build` ✅（Client 2.20 MB / gzip 741.73 kB · Server 778.09 kB · Nitro 7.57 MB）
  - 接口冒烟（preview:3100）：注册 → `GET /api/user/current` → `GET /api/user/:id`（含 `following`）→ `POST /api/user/follow`（`following: true`，`followerCount` 递增）→ `POST /api/pin/publish`（返回 `PinDetail`）→ `GET /api/pin/:id` → `POST /api/user/profile`（昵称/头像/简介/邮箱更新并回传）→ `POST /api/auth/password` 均 `err_no: 0`；改密后旧密码 401「用户名或密码错误」、新密码登录成功；`/api/article/feed?category=follow` 返回已关注作者文章
  - SSR 冒烟：`/settings/profile`、`/settings/account`、`/pins/publish` 未登录均 **302 → `/login?redirect=...`**，带 Cookie 均 **HTTP 200** 且直出「个人资料 / 掘金号 / 发布沸点」；`/pins`、`/user/user_2` **HTTP 200**
  - `nuxt.config.ts#sitemap.exclude` 与 `public/robots.txt` 同步纳入 `/settings`、`/settings/**`、`/pins/publish`（私有页不进 sitemap）
- 取舍说明：标签页「关注」按钮仍为展示态（无标签关注表，不在本次范围）；沸点配图为图片 URL 输入（多张 + 预览 + 删除），不做文件上传 / 对象存储；account 页手机绑定以「暂不支持」占位。
