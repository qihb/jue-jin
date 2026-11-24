import type { ApiResp } from '~~/shared/types'
import { db } from '~~/server/mock/seed'
import { fail, ok } from '~~/server/utils/resp'

/** 收藏结果 */
export interface ArticleCollectResult {
  collected: boolean
  collectCount: number
}

/** 文章收藏 / 取消收藏：mock 直接改内存态，返回最新结果 */
export default defineEventHandler(async (event): Promise<ApiResp<ArticleCollectResult>> => {
  const body = await readBody<{ id?: string } | undefined>(event)
  const article = db.articles.find((item) => item.id === body?.id)
  if (!article) {
    return fail('文章不存在', 404)
  }

  article.collected = !article.collected
  article.collectCount = Math.max(0, article.collectCount + (article.collected ? 1 : -1))
  return ok({ collected: article.collected, collectCount: article.collectCount })
})
