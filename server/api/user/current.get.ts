import type { ApiResp, UserBrief } from '~~/shared/types'
import { db, toUserBrief } from '~~/server/mock/seed'
import { fail, ok } from '~~/server/utils/resp'

/**
 * 当前登录用户。
 * 阶段 4 为占位实现：固定返回 mock 库中的首个用户，供登录拦截与交互演示使用；
 * 阶段 5 接入登录体系后改为按 token 解析真实用户。
 */
export default defineEventHandler((): ApiResp<UserBrief> => {
  const [user] = db.users
  if (!user) {
    return fail('用户不存在', 404)
  }
  return ok(toUserBrief(user))
})
