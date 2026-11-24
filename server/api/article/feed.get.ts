import type { ApiResp, ArticleSummary, CursorPage } from '~~/shared/types'
import { DEFAULT_CATEGORY_ID, FOLLOW_CATEGORY_ID } from '~~/shared/constants'
import { listArticles } from '~~/server/db'
import { normalizeCursorQuery, ok } from '~~/server/utils/resp'

/** 文章流：支持按分类过滤 + 游标分页 */
export default defineEventHandler((event): ApiResp<CursorPage<ArticleSummary>> => {
  const query = getQuery(event)
  const params = normalizeCursorQuery(query)
  const category =
    typeof query.category === 'string' && query.category ? query.category : DEFAULT_CATEGORY_ID

  const userId = (event.context.user as { id: string } | null)?.id ?? null
  const isAggregate = category === DEFAULT_CATEGORY_ID || category === FOLLOW_CATEGORY_ID

  return ok(listArticles({ category: isAggregate ? 'recommend' : category, ...params }, userId))
})
