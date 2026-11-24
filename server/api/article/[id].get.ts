import type { ApiResp, ArticleDetail } from '~~/shared/types'
import { db } from '~~/server/mock/seed'
import { fail, ok } from '~~/server/utils/resp'

/** 文章详情 */
export default defineEventHandler((event): ApiResp<ArticleDetail | null> => {
  const id = getRouterParam(event, 'id')
  const article = db.articles.find((item) => item.id === id)
  if (!article) {
    return fail('文章不存在', 404)
  }
  return ok(article)
})
