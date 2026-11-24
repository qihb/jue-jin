import type { ApiResp, User } from '~~/shared/types'
import { getUserById } from '~~/server/db'
import { fail, ok } from '~~/server/utils/resp'

/** 用户主页资料 */
export default defineEventHandler((event): ApiResp<User | null> => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    return fail('缺少用户 ID', 400)
  }
  const user = getUserById(id)
  if (!user) {
    return fail('用户不存在', 404)
  }
  return ok(user)
})
