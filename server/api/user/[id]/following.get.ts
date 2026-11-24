import type { ApiResp, CursorPage, UserBrief } from '~~/shared/types'
import { listFollowings } from '~~/server/db'
import { fail, normalizeCursorQuery, ok } from '~~/server/utils/resp'

/** 某用户的关注列表：游标分页 */
export default defineEventHandler((event): ApiResp<CursorPage<UserBrief>> => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    return fail<CursorPage<UserBrief>>('缺少用户 ID', 400)
  }
  return ok(listFollowings(id, normalizeCursorQuery(getQuery(event))))
})
