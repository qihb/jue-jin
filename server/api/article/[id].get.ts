import type { ApiResp, ArticleDetail } from '~~/shared/types'
import { getArticleById } from '~~/server/db'
import { fail, ok } from '~~/server/utils/resp'

/** 文章详情 */
export default defineEventHandler((event): ApiResp<ArticleDetail | null> => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    return fail('缺少文章 ID', 400)
  }
  const userId = (event.context.user as { id: string } | null)?.id ?? null
  const article = getArticleById(id, userId)
  if (!article) {
    return fail('文章不存在', 404)
  }
  return ok(article)
})
