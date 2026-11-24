import type { ApiResp, UserBrief } from '~~/shared/types'
import { PASSWORD_MIN_LENGTH } from '~~/shared/constants'
import { getPasswordHash, updateUserPassword } from '~~/server/db'
import { hashPassword, verifyPassword } from '~~/server/utils/password'
import { fail, ok } from '~~/server/utils/resp'

/** 修改密码（需登录）：校验旧密码后写入新密码哈希 */
export default defineEventHandler(async (event): Promise<ApiResp<null>> => {
  const user = event.context.user as UserBrief | null
  if (!user) {
    return fail('请先登录', 401)
  }

  const body = await readBody<{ oldPassword?: string; newPassword?: string } | undefined>(event)
  const oldPassword = body?.oldPassword ?? ''
  const newPassword = body?.newPassword ?? ''

  if (newPassword.length < PASSWORD_MIN_LENGTH) {
    return fail(`新密码至少 ${PASSWORD_MIN_LENGTH} 位`, 400)
  }

  // 已设置过密码的账号必须校验旧密码；未设置过（如演示账号）允许直接设置
  const stored = getPasswordHash(user.id)
  if (stored && !verifyPassword(oldPassword, stored)) {
    return fail('原密码不正确', 400)
  }

  updateUserPassword(user.id, hashPassword(newPassword))
  return ok(null)
})
