import type { ApiResp, CursorPage, PinDetail } from '~~/shared/types'
import { db } from '~~/server/mock/seed'
import { normalizeCursorQuery, ok, paginate } from '~~/server/utils/resp'

/** 沸点列表：游标分页 */
export default defineEventHandler((event): ApiResp<CursorPage<PinDetail>> => {
  const params = normalizeCursorQuery(getQuery(event))
  return ok(paginate(db.pins, params))
})
