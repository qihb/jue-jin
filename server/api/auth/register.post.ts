import type { ApiResp, User } from '~~/shared/types'
import { PASSWORD_MIN_LENGTH, USERNAME_PATTERN } from '~~/shared/constants'
import { createUserWithPassword, getUserByUsername } from '../../db'
import { issueAuthCookie } from '../../utils/auth'
import { hashPassword } from '../../utils/password'
import { fail, ok } from '../../utils/resp'

/** 昵称最大长度 */
const NICKNAME_MAX_LENGTH = 20

/** 注册：校验用户名 / 昵称 / 密码 → 建号并签发 JWT Cookie，返回完整 User */
export default defineEventHandler(async (event): Promise<ApiResp<User>> => {
  const body = await readBody<{ username?: string; nickname?: string; password?: string } | undefined>(
    event,
  )

  const username = body?.username?.trim() ?? ''
  const nickname = body?.nickname?.trim() ?? ''
  const password = body?.password ?? ''

  if (!USERNAME_PATTERN.test(username)) {
    return fail('用户名需为 4~20 位字母、数字或下划线', 400)
  }
  if (!nickname) {
    return fail('昵称不能为空', 400)
  }
  if (nickname.length > NICKNAME_MAX_LENGTH) {
    return fail(`昵称不能超过 ${NICKNAME_MAX_LENGTH} 个字符`, 400)
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    return fail(`密码至少 ${PASSWORD_MIN_LENGTH} 位`, 400)
  }
  if (getUserByUsername(username)) {
    return fail('该用户名已被注册', 409)
  }

  const user = createUserWithPassword({
    username,
    nickname,
    passwordHash: hashPassword(password),
  })

  await issueAuthCookie(event, user)
  return ok(user)
})
