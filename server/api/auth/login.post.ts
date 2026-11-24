import type { ApiResp, UserBrief } from '~~/shared/types'
import { createUser, getUserByUsername } from '../../db'
import { toUserBrief } from '../../mock/seed'
import { AUTH_COOKIE_NAME, signToken } from '../../utils/auth'
import { ok } from '../../utils/resp'

/**
 * 演示登录：一键登录为固定演示账号 `juejin_1`（不存在则创建）。
 * 后续可扩展为账号密码 / OAuth。
 */
export default defineEventHandler(async (event): Promise<ApiResp<UserBrief>> => {
  const DEMO_USERNAME = 'juejin_1'

  let user = getUserByUsername(DEMO_USERNAME)

  // 演示账号不存在时创建（兜底：数据库被清空等场景）
  if (!user) {
    user = createUser({
      id: 'user_demo',
      username: DEMO_USERNAME,
      nickname: '演示用户',
      level: 5,
      description: '这是一个演示账号',
    })
  }

  const brief = toUserBrief(user)
  const token = await signToken(brief)
  setCookie(event, AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 天
  })

  return ok(brief)
})
