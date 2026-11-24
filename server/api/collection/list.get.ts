import type { ApiResp, CollectionSummary, CursorPage } from '~~/shared/types'
import { listCollectionsByUser } from '~~/server/db'
import { normalizeCursorQuery, ok } from '~~/server/utils/resp'

/** 收藏集列表：当前用户的收藏集，游标分页（未登录返回空列表） */
export default defineEventHandler((event): ApiResp<CursorPage<CollectionSummary>> => {
  const user = event.context.user as { id: string } | null
  if (!user) {
    return ok({ list: [], cursor: '', hasMore: false })
  }
  return ok(listCollectionsByUser(user.id, normalizeCursorQuery(getQuery(event))))
})
