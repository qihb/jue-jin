import type { ApiResp, CursorPage, Tag } from '~~/shared/types'
import { db } from '~~/server/mock/seed'
import { normalizeCursorQuery, ok, paginate } from '~~/server/utils/resp'

/** 标签列表：游标分页 */
export default defineEventHandler((event): ApiResp<CursorPage<Tag>> => {
  const params = normalizeCursorQuery(getQuery(event))
  return ok(paginate(db.tags, params))
})
