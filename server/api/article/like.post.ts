import type { ApiResp } from '~~/shared/types'
import { db } from '~~/server/mock/seed'
import { fail, ok } from '~~/server/utils/resp'

/** 点赞结果 */
export interface ArticleLikeResult {
  liked: boolean
  likeCount: number
}

/** 文章点赞 / 取消点赞：mock 直接改内存态，返回最新结果 */
export default defineEventHandler(async (event): Promise<ApiResp<ArticleLikeResult>> => {
  const body = await readBody<{ id?: string } | undefined>(event)
  const article = db.articles.find((item) => item.id === body?.id)
  if (!article) {
    return fail('文章不存在', 404)
  }

  article.liked = !article.liked
  article.likeCount = Math.max(0, article.likeCount + (article.liked ? 1 : -1))
  return ok({ liked: article.liked, likeCount: article.likeCount })
})
