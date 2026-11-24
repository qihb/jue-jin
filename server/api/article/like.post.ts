import type { ApiResp } from '~~/shared/types'
import { toggleArticleLike } from '~~/server/db'
import { fail, ok } from '~~/server/utils/resp'

/** 点赞结果 */
export interface ArticleLikeResult {
  liked: boolean
  likeCount: number
}

/** 文章点赞 / 取消点赞（需登录） */
export default defineEventHandler(async (event): Promise<ApiResp<ArticleLikeResult>> => {
  const user = event.context.user as { id: string } | null
  if (!user) {
    return fail('请先登录', 401)
  }

  const body = await readBody<{ id?: string } | undefined>(event)
  const articleId = body?.id
  if (!articleId) {
    return fail('文章 id 不能为空', 400)
  }

  const result = toggleArticleLike(articleId, user.id)
  return ok(result)
})
