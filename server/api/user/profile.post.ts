import type { ApiResp, User } from '~~/shared/types'
import {
  EMAIL_PATTERN,
  NICKNAME_MAX_LENGTH,
  USER_DESCRIPTION_MAX_LENGTH,
} from '~~/shared/constants'
import { updateUserProfile } from '~~/server/db'
import { fail, ok } from '~~/server/utils/resp'

/** 职位 / 公司最大长度 */
const JOB_MAX_LENGTH = 30
const COMPANY_MAX_LENGTH = 30
/** 头像地址最大长度 */
const AVATAR_MAX_LENGTH = 500

/** 更新个人资料（需登录） */
export default defineEventHandler(async (event): Promise<ApiResp<User>> => {
  const user = event.context.user as { id: string } | null
  if (!user) {
    return fail('请先登录', 401)
  }

  const body = await readBody<Record<string, unknown> | undefined>(event)

  const nickname = typeof body?.nickname === 'string' ? body.nickname.trim() : ''
  if (!nickname) return fail('昵称不能为空', 400)
  if (nickname.length > NICKNAME_MAX_LENGTH) {
    return fail(`昵称不能超过 ${NICKNAME_MAX_LENGTH} 个字符`, 400)
  }

  const avatar = typeof body?.avatar === 'string' ? body.avatar.trim() : ''
  if (avatar.length > AVATAR_MAX_LENGTH) return fail('头像地址过长', 400)

  const job = typeof body?.job === 'string' ? body.job.trim() : ''
  if (job.length > JOB_MAX_LENGTH) return fail(`职位不能超过 ${JOB_MAX_LENGTH} 个字符`, 400)

  const company = typeof body?.company === 'string' ? body.company.trim() : ''
  if (company.length > COMPANY_MAX_LENGTH) return fail(`公司不能超过 ${COMPANY_MAX_LENGTH} 个字符`, 400)

  const description = typeof body?.description === 'string' ? body.description.trim() : ''
  if (description.length > USER_DESCRIPTION_MAX_LENGTH) {
    return fail(`个人简介不能超过 ${USER_DESCRIPTION_MAX_LENGTH} 个字符`, 400)
  }

  const email = typeof body?.email === 'string' ? body.email.trim() : ''
  if (email && !EMAIL_PATTERN.test(email)) return fail('邮箱格式不正确', 400)

  const updated = updateUserProfile(user.id, { nickname, avatar, job, company, description, email })
  if (!updated) return fail('用户不存在', 404)

  return ok(updated)
})
