import type { ApiResp, ArticleSummary } from '~~/shared/types'
import { listTopArticles } from '~~/server/db'
import { normalizeCursorQuery, ok } from '~~/server/utils/resp'

/** 文章榜最多展示条数 */
const RANK_MAX = 10

/** 文章榜：按阅读量倒序取前 N 篇（榜单天然有界，取 limit 与上限中的较小值） */
export default defineEventHandler((event): ApiResp<ArticleSummary[]> => {
  const { limit } = normalizeCursorQuery(getQuery(event))
  const userId = (event.context.user as { id: string } | null)?.id ?? null
  return ok(listTopArticles(Math.min(limit, RANK_MAX), userId))
})
