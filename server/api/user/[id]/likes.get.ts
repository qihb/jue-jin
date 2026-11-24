import type { ApiResp, ArticleSummary, CursorPage } from '~~/shared/types'
import { listLikedArticles } from '~~/server/db'
import { fail, normalizeCursorQuery, ok } from '~~/server/utils/resp'

/** 某用户赞过的文章：游标分页 */
export default defineEventHandler((event): ApiResp<CursorPage<ArticleSummary>> => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    return fail<CursorPage<ArticleSummary>>('缺少用户 ID', 400)
  }
  const viewerId = (event.context.user as { id: string } | null)?.id ?? null
  return ok(listLikedArticles(id, normalizeCursorQuery(getQuery(event)), viewerId))
})
