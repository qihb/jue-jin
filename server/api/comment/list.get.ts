import type { ApiResp, Comment, CommentTargetType, CursorPage } from '~~/shared/types'
import { listComments } from '~~/server/db'
import { normalizeCursorQuery, ok } from '~~/server/utils/resp'

/** 评论列表：按挂载目标过滤 + 游标分页 */
export default defineEventHandler((event): ApiResp<CursorPage<Comment>> => {
  const query = getQuery(event)
  const params = normalizeCursorQuery(query)
  const targetType: CommentTargetType = query.targetType === 'pin' ? 'pin' : 'article'
  const targetId = typeof query.targetId === 'string' ? query.targetId : ''

  return ok(listComments({ targetType, targetId, ...params }, null))
})
