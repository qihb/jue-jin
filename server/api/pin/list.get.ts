import type { ApiResp, CursorPage, PinDetail } from '~~/shared/types'
import { listPins } from '~~/server/db'
import { normalizeCursorQuery, ok } from '~~/server/utils/resp'

/** 沸点列表：游标分页 */
export default defineEventHandler((event): ApiResp<CursorPage<PinDetail>> => {
  const params = normalizeCursorQuery(getQuery(event))
  const userId = (event.context.user as { id: string } | null)?.id ?? null
  return ok(listPins(params, userId))
})
