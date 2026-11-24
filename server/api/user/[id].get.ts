import type { ApiResp, User } from '~~/shared/types'
import { db } from '~~/server/mock/seed'
import { fail, ok } from '~~/server/utils/resp'

/** 用户主页资料 */
export default defineEventHandler((event): ApiResp<User | null> => {
  const id = getRouterParam(event, 'id')
  const user = db.users.find((item) => item.id === id)
  if (!user) {
    return fail('用户不存在', 404)
  }
  return ok(user)
})
