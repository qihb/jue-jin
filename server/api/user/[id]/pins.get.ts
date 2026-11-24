import type { ApiResp, CursorPage, PinDetail } from '~~/shared/types'
import { listPinsByAuthor } from '~~/server/db'
import { fail, normalizeCursorQuery, ok } from '~~/server/utils/resp'

/** 某用户发布的沸点：游标分页 */
export default defineEventHandler((event): ApiResp<CursorPage<PinDetail>> => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    return fail<CursorPage<PinDetail>>('缺少用户 ID', 400)
  }
  const viewerId = (event.context.user as { id: string } | null)?.id ?? null
  return ok(listPinsByAuthor(id, normalizeCursorQuery(getQuery(event)), viewerId))
})
