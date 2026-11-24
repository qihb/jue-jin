import type { ApiResp, CollectionDetail } from '~~/shared/types'
import { getCollectionById } from '~~/server/db'
import { normalizeCursorQuery, ok } from '~~/server/utils/resp'

/** 收藏集详情：概要 + 收录文章（游标分页）。不存在或非本人收藏集返回 null */
export default defineEventHandler((event): ApiResp<CollectionDetail | null> => {
  const id = getRouterParam(event, 'id')
  const userId = (event.context.user as { id: string } | null)?.id ?? null
  if (!id) {
    return ok(null)
  }
  return ok(getCollectionById(id, userId, normalizeCursorQuery(getQuery(event))))
})
