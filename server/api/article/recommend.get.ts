import type { ApiResp, ArticleSummary } from '~~/shared/types'
import { db, toArticleSummary } from '~~/server/mock/seed'
import { ok } from '~~/server/utils/resp'

/** 相关推荐条数 */
const RECOMMEND_SIZE = 6

/** 相关推荐文章：优先同分类，不足时用全站内容补齐，排除当前文章 */
export default defineEventHandler((event): ApiResp<ArticleSummary[]> => {
  const query = getQuery(event)
  const id = typeof query.id === 'string' ? query.id : ''
  const current = db.articles.find((item) => item.id === id)

  const sameCategory = current
    ? db.articles.filter((item) => item.categoryId === current.categoryId && item.id !== current.id)
    : []
  const source =
    sameCategory.length >= RECOMMEND_SIZE
      ? sameCategory
      : [...sameCategory, ...db.articles.filter((item) => item.id !== id)]

  return ok(source.slice(0, RECOMMEND_SIZE).map(toArticleSummary))
})
