import type { ApiResp, ArticleSummary, CursorPage } from '~~/shared/types'
import { DEFAULT_SORT, SORT_FOLLOW, SORT_NEWEST, SORT_RECOMMEND } from '~~/shared/constants'
import { listArticles } from '~~/server/db'
import { normalizeCursorQuery, ok } from '~~/server/utils/resp'

type ArticleSort = 'recommend' | 'newest' | 'follow'

const VALID_SORTS: ArticleSort[] = [SORT_RECOMMEND, SORT_NEWEST, SORT_FOLLOW]

/** 文章流：支持按分类过滤（category）+ 排序方式（sort）+ 游标分页 */
export default defineEventHandler((event): ApiResp<CursorPage<ArticleSummary>> => {
  const query = getQuery(event)
  const params = normalizeCursorQuery(query)

  // category：分类筛选，空串表示「综合」（全部）
  const category = typeof query.category === 'string' ? query.category : ''
  // sort：排序方式，默认 recommend
  const sortRaw = typeof query.sort === 'string' ? query.sort : DEFAULT_SORT
  const sort = VALID_SORTS.includes(sortRaw as ArticleSort) ? (sortRaw as ArticleSort) : DEFAULT_SORT

  const userId = (event.context.user as { id: string } | null)?.id ?? null

  return ok(listArticles({ category, sort, ...params }, userId))
})
