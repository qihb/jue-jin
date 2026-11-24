import type { CollectionDetail, CollectionSummary, CursorPage, ID } from '~~/shared/types'
import { toArticleSummary } from '../../mock/seed'
import { db } from '../schema'
import {
  isArticleCollected,
  isArticleLiked,
  rowToArticleDetail,
  type ArticleWithAuthorRow,
} from './article'

/* ============================== 收藏集 ============================== */

const COLLECTION_SELECT = `
  SELECT c.*, (SELECT COUNT(*) FROM collection_articles ca WHERE ca.collection_id = c.id) AS article_count
  FROM collections c
`

interface CollectionRow {
  id: string
  user_id: string
  name: string
  description: string
  cover: string
  created_at: string
  updated_at: string
  article_count: number
}

function rowToCollectionSummary(row: CollectionRow): CollectionSummary {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    cover: row.cover,
    articleCount: row.article_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/** 指定用户的收藏集列表：按更新时间倒序游标分页（收藏集公开可读） */
export function listCollectionsByUser(
  userId: ID,
  params: { limit: number; cursor: string },
): CursorPage<CollectionSummary> {
  const { limit, cursor } = params
  const offset = Number.parseInt(cursor, 10) || 0

  const rows = db
    .prepare(`${COLLECTION_SELECT} WHERE c.user_id = ? ORDER BY c.updated_at DESC LIMIT ? OFFSET ?`)
    .all(userId, limit + 1, offset) as unknown as CollectionRow[]

  const hasMore = rows.length > limit
  const list = rows.slice(0, limit).map(rowToCollectionSummary)

  return { list, cursor: hasMore ? String(offset + limit) : '', hasMore }
}

/** 收藏集详情：概要 + 收录文章（游标分页）。收藏集公开可读，不存在返回 null */
export function getCollectionById(
  id: ID,
  userId: ID | null,
  params: { limit: number; cursor: string },
): CollectionDetail | null {
  const row = db.prepare(`${COLLECTION_SELECT} WHERE c.id = ?`).get(id) as CollectionRow | undefined
  if (!row) return null

  const { limit, cursor } = params
  const offset = Number.parseInt(cursor, 10) || 0

  const articleRows = db
    .prepare(
      `SELECT a.*, u.username, u.nickname, u.avatar, u.level, u.description
       FROM collection_articles ca
       JOIN articles a ON a.id = ca.article_id
       JOIN users u ON u.id = a.author_id
       WHERE ca.collection_id = ?
       ORDER BY ca.sort_order ASC
       LIMIT ? OFFSET ?`,
    )
    .all(id, limit + 1, offset) as unknown as ArticleWithAuthorRow[]

  const hasMore = articleRows.length > limit
  const articles = articleRows
    .slice(0, limit)
    .map((articleRow) =>
      toArticleSummary(
        rowToArticleDetail(
          articleRow,
          isArticleLiked(articleRow.id, userId),
          isArticleCollected(articleRow.id, userId),
        ),
      ),
    )

  return {
    collection: rowToCollectionSummary(row),
    articles: { list: articles, cursor: hasMore ? String(offset + limit) : '', hasMore },
  }
}
