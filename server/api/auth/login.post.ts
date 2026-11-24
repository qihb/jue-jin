import type { ApiResp, UserBrief } from '~~/shared/types'
import { createUser, getPasswordHash, getUserByUsername } from '../../db'
import { toUserBrief } from '../../mock/seed'
import { issueAuthCookie } from '../../utils/auth'
import { verifyPassword } from '../../utils/password'
import { fail, ok } from '../../utils/resp'

/**
 * 登录：带 `username` / `password` 时走真实密码校验；
 * 无 body 时保持原有「一键演示登录」（登录为固定演示账号 `juejin_1`）。
 */
export default defineEventHandler(async (event): Promise<ApiResp<UserBrief>> => {
  const body = await readBody<{ username?: string; password?: string } | undefined>(event).catch(
    () => undefined,
  )
  const username = body?.username?.trim()
  const password = body?.password

  // 账号密码登录
  if (username && password) {
    const user = getUserByUsername(username)
    const stored = user ? getPasswordHash(user.id) : null
    if (!user || !stored || !verifyPassword(password, stored)) {
      return fail('用户名或密码错误', 401)
    }
    const brief = toUserBrief(user)
    await issueAuthCookie(event, brief)
    return ok(brief)
  }

  // 一键演示登录
  const DEMO_USERNAME = 'juejin_1'
  let user = getUserByUsername(DEMO_USERNAME)
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
  await issueAuthCookie(event, brief)
  return ok(brief)
})
