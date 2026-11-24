import type { ApiResp, CollectionSummary, CursorPage } from '~~/shared/types'
import { listCollectionsByUser } from '~~/server/db'
import { fail, normalizeCursorQuery, ok } from '~~/server/utils/resp'

/** 某用户的收藏集：游标分页（公开可读） */
export default defineEventHandler((event): ApiResp<CursorPage<CollectionSummary>> => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    return fail<CursorPage<CollectionSummary>>('缺少用户 ID', 400)
  }
  return ok(listCollectionsByUser(id, normalizeCursorQuery(getQuery(event))))
})
