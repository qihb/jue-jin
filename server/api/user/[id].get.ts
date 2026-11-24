import type { ApiResp, UserProfile } from '~~/shared/types'
import { getUserById, isFollowing } from '~~/server/db'
import { fail, ok } from '~~/server/utils/resp'

/** 用户主页资料：完整资料 + 当前登录用户的关注态 */
export default defineEventHandler((event): ApiResp<UserProfile> => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    return fail<UserProfile>('缺少用户 ID', 400)
  }
  const user = getUserById(id)
  if (!user) {
    return fail<UserProfile>('用户不存在', 404)
  }
  const viewerId = (event.context.user as { id: string } | null)?.id ?? null
  return ok({ ...user, following: isFollowing(viewerId, id) })
})
