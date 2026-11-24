import type { ApiResp, CursorPage, SearchItem, SearchType } from '~~/shared/types'
import { DEFAULT_SEARCH_TYPE, isSearchType } from '~~/shared/constants'
import { searchArticles, searchBooks, searchTags, searchUsers, isFollowing } from '~~/server/db'
import { normalizeCursorQuery, ok, paginate } from '~~/server/utils/resp'

/**
 * 全局搜索：按分类聚合文章 / 用户 / 标签 / 小册结果，
 * 合并为统一的 `SearchItem[]` 后走游标分页。
 */
export default defineEventHandler((event): ApiResp<CursorPage<SearchItem>> => {
  const query = getQuery(event)
  const keyword = typeof query.q === 'string' ? query.q.trim() : ''
  const type: SearchType = isSearchType(query.type) ? query.type : DEFAULT_SEARCH_TYPE

  if (!keyword) {
    return ok({ list: [], cursor: '', hasMore: false })
  }

  const userId = (event.context.user as { id: string } | null)?.id ?? null
  const items: SearchItem[] = []

  if (type === 'all' || type === 'article') {
    items.push(
      ...searchArticles(keyword, userId).map((article) => ({ type: 'article' as const, article })),
    )
  }
  if (type === 'all' || type === 'user') {
    items.push(
      ...searchUsers(keyword).map((user) => ({
        type: 'user' as const,
        user,
        following: isFollowing(userId, user.id),
      })),
    )
  }
  if (type === 'all' || type === 'tag') {
    items.push(...searchTags(keyword).map((tag) => ({ type: 'tag' as const, tag })))
  }
  if (type === 'all' || type === 'book') {
    items.push(...searchBooks(keyword).map((book) => ({ type: 'book' as const, book })))
  }

  return ok(paginate(items, normalizeCursorQuery(query)))
})
