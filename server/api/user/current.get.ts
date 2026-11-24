import type { ApiResp, UserBrief } from '~~/shared/types'
import { fail, ok } from '~~/server/utils/resp'

/**
 * 当前登录用户：从 JWT 中间件解析的 event.context.user 读取。
 * 未登录返回 401，由前端唤起登录弹窗。
 */
export default defineEventHandler((event): ApiResp<UserBrief> => {
  const user = event.context.user as UserBrief | null
  if (!user) {
    return fail('未登录', 401)
  }
  return ok(user)
})
