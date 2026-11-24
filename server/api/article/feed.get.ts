import type { ApiResp, ArticleSummary, CursorPage } from '~~/shared/types'
import { DEFAULT_CATEGORY_ID, FOLLOW_CATEGORY_ID } from '~~/shared/constants'
import { db, toArticleSummary } from '~~/server/mock/seed'
import { normalizeCursorQuery, ok, paginate } from '~~/server/utils/resp'

/** 文章流：支持按分类过滤 + 游标分页 */
export default defineEventHandler((event): ApiResp<CursorPage<ArticleSummary>> => {
  const query = getQuery(event)
  const params = normalizeCursorQuery(query)
  const category =
    typeof query.category === 'string' && query.category ? query.category : DEFAULT_CATEGORY_ID

  const isAggregate = category === DEFAULT_CATEGORY_ID || category === FOLLOW_CATEGORY_ID
  const source = isAggregate
    ? db.articles
    : db.articles.filter((article) => article.categoryId === category)

  const page = paginate(source, params)
  return ok({ ...page, list: page.list.map(toArticleSummary) })
})
