import type { ApiResp, ArticleSummary, CursorPage } from '~~/shared/types'
import { db, toArticleSummary } from '~~/server/mock/seed'
import { normalizeCursorQuery, ok, paginate } from '~~/server/utils/resp'

/** 创作者中心 · 内容管理：当前用户发布的文章（游标分页） */
export default defineEventHandler((event): ApiResp<CursorPage<ArticleSummary>> => {
  const params = normalizeCursorQuery(getQuery(event))
  const [current] = db.users
  const source = current ? db.articles.filter((item) => item.author.id === current.id) : []

  const page = paginate(source, params)
  return ok({ ...page, list: page.list.map(toArticleSummary) })
})
