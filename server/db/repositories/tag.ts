import type { ArticleSummary, CursorPage, ID, Tag } from '~~/shared/types'
import { toArticleSummary } from '../../mock/seed'
import { db } from '../schema'
import {
  ARTICLE_SELECT,
  isArticleCollected,
  isArticleLiked,
  rowToArticleDetail,
  type ArticleWithAuthorRow,
} from './article'

/* ============================== 标签 ============================== */

export function listTags(params: { limit: number; cursor: string }): CursorPage<Tag> {
  const { limit, cursor } = params
  const offset = Number.parseInt(cursor, 10) || 0

  const rows = db
    .prepare('SELECT * FROM tags ORDER BY article_count DESC LIMIT ? OFFSET ?')
    .all(limit + 1, offset) as unknown as TagRow[]

  const hasMore = rows.length > limit
  const list = rows.slice(0, limit).map(rowToTag)

  return { list, cursor: hasMore ? String(offset + limit) : '', hasMore }
}

export interface TagRow {
  id: string
  name: string
  icon: string
  category_id: string
  description: string
  article_count: number
  follower_count: number
}

/** 标签行 → 领域对象（表字段为 snake_case，需显式映射） */
export function rowToTag(row: TagRow): Tag {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    categoryId: row.category_id,
    description: row.description,
    articleCount: row.article_count,
    followerCount: row.follower_count,
  }
}

/** 按标签名取标签（标签页详情用） */
export function getTagByName(name: string): Tag | null {
  const row = db.prepare('SELECT * FROM tags WHERE name = ?').get(name) as TagRow | undefined
  return row ? rowToTag(row) : null
}

/** 标签下的文章流：tags 以 JSON 数组文本存储，用 LIKE 匹配标签名 */
export function listArticlesByTag(
  tagName: string,
  params: { limit: number; cursor: string },
  userId: ID | null,
): CursorPage<ArticleSummary> {
  const { limit, cursor } = params
  const offset = Number.parseInt(cursor, 10) || 0

  const rows = db
    .prepare(`${ARTICLE_SELECT} WHERE a.tags LIKE ? ORDER BY a.created_at DESC LIMIT ? OFFSET ?`)
    .all(`%"${tagName}"%`, limit + 1, offset) as unknown as ArticleWithAuthorRow[]

  const hasMore = rows.length > limit
  const list = rows.slice(0, limit).map((row) =>
    toArticleSummary(rowToArticleDetail(row, isArticleLiked(row.id, userId), isArticleCollected(row.id, userId))),
  )

  return { list, cursor: hasMore ? String(offset + limit) : '', hasMore }
}

/** 文章榜：按阅读量倒序取前 N 篇 */
export function listTopArticles(limit: number, userId: ID | null): ArticleSummary[] {
  const rows = db
    .prepare(`${ARTICLE_SELECT} ORDER BY a.view_count DESC, a.created_at DESC LIMIT ?`)
    .all(limit) as unknown as ArticleWithAuthorRow[]
  return rows.map((row) =>
    toArticleSummary(rowToArticleDetail(row, isArticleLiked(row.id, userId), isArticleCollected(row.id, userId))),
  )
}
