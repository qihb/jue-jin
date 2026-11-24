import type { ApiResp, Comment, CommentTargetType } from '~~/shared/types'
import { createComment } from '~~/server/db'
import { fail, ok } from '~~/server/utils/resp'

/** 发表评论（需登录） */
export default defineEventHandler(async (event): Promise<ApiResp<Comment>> => {
  const user = event.context.user as { id: string } | null
  if (!user) {
    return fail('请先登录', 401)
  }

  const body = await readBody<{ targetType?: string; targetId?: string; content?: string } | undefined>(
    event,
  )
  const content = body?.content?.trim() ?? ''
  if (!content) {
    return fail('评论内容不能为空', 400)
  }

  const targetType: CommentTargetType = body?.targetType === 'pin' ? 'pin' : 'article'
  const targetId = body?.targetId ?? ''

  const comment = createComment({ targetType, targetId, content, authorId: user.id })
  return ok(comment)
})
