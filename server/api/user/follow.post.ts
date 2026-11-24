import type { ApiResp, FollowState } from '~~/shared/types'
import { getUserById, toggleFollow } from '~~/server/db'
import { fail, ok } from '~~/server/utils/resp'

/** 关注 / 取关（需登录）：返回目标用户的最新关注态 */
export default defineEventHandler(async (event): Promise<ApiResp<FollowState>> => {
  const user = event.context.user as { id: string } | null
  if (!user) {
    return fail<FollowState>('请先登录', 401)
  }

  const body = await readBody<{ userId?: string } | undefined>(event)
  const targetId = body?.userId
  if (!targetId) {
    return fail<FollowState>('缺少用户 ID', 400)
  }
  if (!getUserById(targetId)) {
    return fail<FollowState>('用户不存在', 404)
  }

  return ok(toggleFollow(user.id, targetId))
})
