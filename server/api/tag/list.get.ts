import type { ApiResp, CursorPage, Tag } from '~~/shared/types'
import { listTags } from '~~/server/db'
import { normalizeCursorQuery, ok } from '~~/server/utils/resp'

/** 标签列表：游标分页 */
export default defineEventHandler((event): ApiResp<CursorPage<Tag>> => {
  const params = normalizeCursorQuery(getQuery(event))
  return ok(listTags(params))
})
