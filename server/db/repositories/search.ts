import type { ArticleSummary, BookSummary, ID, Tag, UserBrief } from '~~/shared/types'
import { toArticleSummary, toUserBrief } from '../../mock/seed'
import { db } from '../schema'
import {
  ARTICLE_SELECT,
  isArticleCollected,
  isArticleLiked,
  rowToArticleDetail,
  type ArticleWithAuthorRow,
} from './article'
import { BOOK_SELECT, rowToBookDetail, toBookSummary, type BookWithAuthorRow } from './book'
import { rowToTag, type TagRow } from './tag'
import { rowToUser, type UserRow } from './user'

/* ============================== 搜索 ============================== */

/** LIKE 参数：`%关键字%`（mock 数据量小，未对通配符做转义） */
function likeParam(keyword: string): string {
  return `%${keyword}%`
}

export function searchArticles(keyword: string, userId: ID | null): ArticleSummary[] {
  const like = likeParam(keyword)
  const rows = db
    .prepare(
      `${ARTICLE_SELECT} WHERE a.title LIKE ? OR a.brief LIKE ? OR u.nickname LIKE ? ORDER BY a.view_count DESC, a.created_at DESC`,
    )
    .all(like, like, like) as unknown as ArticleWithAuthorRow[]
  return rows.map((row) =>
    toArticleSummary(rowToArticleDetail(row, isArticleLiked(row.id, userId), isArticleCollected(row.id, userId))),
  )
}

export function searchUsers(keyword: string): UserBrief[] {
  const like = likeParam(keyword)
  const rows = db
    .prepare(
      'SELECT * FROM users WHERE nickname LIKE ? OR username LIKE ? OR description LIKE ? ORDER BY power DESC LIMIT 30',
    )
    .all(like, like, like) as unknown as UserRow[]
  return rows.map((row) => toUserBrief(rowToUser(row)))
}

export function searchTags(keyword: string): Tag[] {
  const like = likeParam(keyword)
  const rows = db
    .prepare('SELECT * FROM tags WHERE name LIKE ? OR description LIKE ? ORDER BY article_count DESC')
    .all(like, like) as unknown as TagRow[]
  return rows.map(rowToTag)
}

export function searchBooks(keyword: string): BookSummary[] {
  const like = likeParam(keyword)
  const rows = db
    .prepare(`${BOOK_SELECT} WHERE b.title LIKE ? OR b.description LIKE ? ORDER BY b.learner_count DESC`)
    .all(like, like) as unknown as BookWithAuthorRow[]
  return rows.map((row) => toBookSummary(rowToBookDetail(row)))
}
