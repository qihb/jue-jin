import type { ApiResp } from '~~/shared/types'
import { toggleArticleCollect } from '~~/server/db'
import { fail, ok } from '~~/server/utils/resp'

/** 收藏结果 */
export interface ArticleCollectResult {
  collected: boolean
  collectCount: number
}

/** 文章收藏 / 取消收藏（需登录） */
export default defineEventHandler(async (event): Promise<ApiResp<ArticleCollectResult>> => {
  const user = event.context.user as { id: string } | null
  if (!user) {
    return fail('请先登录', 401)
  }

  const body = await readBody<{ id?: string } | undefined>(event)
  const articleId = body?.id
  if (!articleId) {
    return fail('文章 id 不能为空', 400)
  }

  const result = toggleArticleCollect(articleId, user.id)
  return ok(result)
})
