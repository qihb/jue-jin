import type { ApiResp, ArticleSummary, CursorPage } from '~~/shared/types'
import { getUserById, listArticlesByAuthor } from '~~/server/db'
import { normalizeCursorQuery, ok, fail } from '~~/server/utils/resp'

/** 创作者中心 · 内容管理：当前用户发布的文章（游标分页） */
export default defineEventHandler((event): ApiResp<CursorPage<ArticleSummary>> => {
  const params = normalizeCursorQuery(getQuery(event))
  const user = event.context.user as { id: string } | null
  if (!user) {
    return fail('请先登录', 401)
  }

  const current = getUserById(user.id)
  if (!current) {
    return fail('用户不存在', 404)
  }

  return ok(listArticlesByAuthor(current.id, params, user.id))
})
