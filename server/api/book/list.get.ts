import type { ApiResp, BookSummary, CursorPage } from '~~/shared/types'
import { listBooks } from '~~/server/db'
import { normalizeCursorQuery, ok } from '~~/server/utils/resp'

/** 小册列表：游标分页 */
export default defineEventHandler((event): ApiResp<CursorPage<BookSummary>> => {
  return ok(listBooks(normalizeCursorQuery(getQuery(event))))
})
