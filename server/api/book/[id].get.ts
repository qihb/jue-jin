import type { ApiResp, BookDetail } from '~~/shared/types'
import { getBookById } from '~~/server/db'
import { fail, ok } from '~~/server/utils/resp'

/** 小册详情：含章节目录 */
export default defineEventHandler((event): ApiResp<BookDetail | null> => {
  const id = getRouterParam(event, 'id')
  const book = id ? getBookById(id) : null
  if (!book) {
    return fail('小册不存在', 404)
  }
  return ok(book)
})
