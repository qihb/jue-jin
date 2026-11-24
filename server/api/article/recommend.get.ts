import type { ApiResp, ArticleSummary } from '~~/shared/types'
import { listRecommendArticles } from '~~/server/db'
import { ok } from '~~/server/utils/resp'

/** 相关推荐条数 */
const RECOMMEND_SIZE = 6

/** 相关推荐文章：优先同分类，不足时用全站内容补齐，排除当前文章 */
export default defineEventHandler((event): ApiResp<ArticleSummary[]> => {
  const query = getQuery(event)
  const id = typeof query.id === 'string' ? query.id : ''
  const userId = (event.context.user as { id: string } | null)?.id ?? null

  return ok(listRecommendArticles(id, RECOMMEND_SIZE, userId))
})
