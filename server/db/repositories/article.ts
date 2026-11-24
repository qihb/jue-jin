import type { ArticleDetail, ArticleSummary, CursorPage, ID } from '~~/shared/types'
import { toArticleSummary } from '../../mock/seed'
import { db } from '../schema'
import { isFollowing, type UserRow } from './user'

/* ============================== 行 → 领域对象映射 ============================== */

interface ArticleRow {
  id: string
  title: string
  brief: string
  cover: string
  category_id: string
  tags: string
  author_id: string
  view_count: number
  like_count: number
  comment_count: number
  collect_count: number
  created_at: string
  is_hot: number
  content: string
}

/** JOIN 文章作者后的行 */
export interface ArticleWithAuthorRow extends ArticleRow {
  username: string
  nickname: string
  avatar: string
  level: number
  description: string
}

export function rowToArticleDetail(
  row: ArticleWithAuthorRow,
  liked: boolean,
  collected: boolean,
  following = false,
): ArticleDetail {
  return {
    id: row.id,
    title: row.title,
    brief: row.brief,
    cover: row.cover,
    categoryId: row.category_id,
    tags: JSON.parse(row.tags) as string[],
    author: {
      id: row.author_id,
      username: row.username,
      nickname: row.nickname,
      avatar: row.avatar,
      level: row.level,
      description: row.description,
    },
    viewCount: row.view_count,
    likeCount: row.like_count,
    commentCount: row.comment_count,
    collectCount: row.collect_count,
    createdAt: row.created_at,
    isHot: row.is_hot === 1,
    content: row.content,
    liked,
    collected,
    following,
  }
}

/* ============================== 关系表查询：当前用户交互态 ============================== */

export function isArticleLiked(articleId: ID, userId: ID | null): boolean {
  if (!userId) return false
  const row = db
    .prepare('SELECT 1 AS v FROM article_likes WHERE article_id = ? AND user_id = ?')
    .get(articleId, userId) as { v: number } | undefined
  return !!row
}

export function isArticleCollected(articleId: ID, userId: ID | null): boolean {
  if (!userId) return false
  const row = db
    .prepare('SELECT 1 AS v FROM article_collects WHERE article_id = ? AND user_id = ?')
    .get(articleId, userId) as { v: number } | undefined
  return !!row
}

/* ============================== 文章 ============================== */

export const ARTICLE_SELECT = `
  SELECT a.*, u.username, u.nickname, u.avatar, u.level, u.description
  FROM articles a
  JOIN users u ON u.id = a.author_id
`

/**
 * 文章流：按分类过滤 + 排序方式 + 游标分页（cursor = 偏移量）。
 * - category：分类筛选，空串表示「综合」（全部）
 * - sort：排序方式
 *   - recommend：按热度（view_count + like_count）倒序
 *   - newest：按发布时间倒序
 *   - follow：仅关注作者的文章（未登录返回空）
 */
export function listArticles(
  params: { category: string; sort: 'recommend' | 'newest' | 'follow'; limit: number; cursor: string },
  userId: ID | null,
): CursorPage<ArticleSummary> {
  const { category, sort, limit, cursor } = params
  const offset = Number.parseInt(cursor, 10) || 0

  const order =
    sort === 'newest'
      ? 'ORDER BY a.created_at DESC'
      : sort === 'follow'
        ? 'ORDER BY a.created_at DESC'
        : 'ORDER BY (a.view_count + a.like_count) DESC, a.created_at DESC'

  let rows: ArticleWithAuthorRow[]

  // 关注流：仅返回关注作者的文章
  if (sort === 'follow') {
    if (!userId) {
      return { list: [], cursor: '', hasMore: false }
    }
    const where = category ? `WHERE a.category_id = ?` : ''
    const categoryClause = category ? [category] : []
    rows = db
      .prepare(
        `${ARTICLE_SELECT} JOIN follows f ON f.followee_id = a.author_id AND f.follower_id = ? ${where} ${order} LIMIT ? OFFSET ?`,
      )
      .all(userId, ...categoryClause, limit + 1, offset) as unknown as ArticleWithAuthorRow[]
  } else if (category) {
    // 指定分类
    rows = db
      .prepare(`${ARTICLE_SELECT} WHERE a.category_id = ? ${order} LIMIT ? OFFSET ?`)
      .all(category, limit + 1, offset) as unknown as ArticleWithAuthorRow[]
  } else {
    // 综合（全部分类）
    rows = db
      .prepare(`${ARTICLE_SELECT} ${order} LIMIT ? OFFSET ?`)
      .all(limit + 1, offset) as unknown as ArticleWithAuthorRow[]
  }

  const hasMore = rows.length > limit
  const list = rows.slice(0, limit).map((row) =>
    toArticleSummary(rowToArticleDetail(row, isArticleLiked(row.id, userId), isArticleCollected(row.id, userId))),
  )

  return {
    list,
    cursor: hasMore ? String(offset + limit) : '',
    hasMore,
  }
}

export function getArticleById(id: ID, userId: ID | null): ArticleDetail | null {
  const row = db
    .prepare(`${ARTICLE_SELECT} WHERE a.id = ?`)
    .get(id) as ArticleWithAuthorRow | undefined
  if (!row) return null
  return rowToArticleDetail(
    row,
    isArticleLiked(id, userId),
    isArticleCollected(id, userId),
    isFollowing(userId, row.author_id),
  )
}

export function listRecommendArticles(id: ID, limit: number, userId: ID | null): ArticleSummary[] {
  const current = db.prepare('SELECT category_id FROM articles WHERE id = ?').get(id) as
    | { category_id: string }
    | undefined
  const categoryId = current?.category_id

  const sameCategory = categoryId
    ? (db
        .prepare(`${ARTICLE_SELECT} WHERE a.category_id = ? AND a.id != ? ORDER BY a.created_at DESC LIMIT ?`)
        .all(categoryId, id, limit) as unknown as ArticleWithAuthorRow[])
    : []

  if (sameCategory.length >= limit) {
    return sameCategory.map((row) =>
      toArticleSummary(rowToArticleDetail(row, isArticleLiked(row.id, userId), isArticleCollected(row.id, userId))),
    )
  }

  const rest = db
    .prepare(`${ARTICLE_SELECT} WHERE a.id != ? ORDER BY a.created_at DESC LIMIT ?`)
    .all(id, limit - sameCategory.length) as unknown as ArticleWithAuthorRow[]

  return [...sameCategory, ...rest].map((row) =>
    toArticleSummary(rowToArticleDetail(row, isArticleLiked(row.id, userId), isArticleCollected(row.id, userId))),
  )
}

export function listArticlesByAuthor(
  authorId: ID,
  params: { limit: number; cursor: string },
  userId: ID | null,
): CursorPage<ArticleSummary> {
  const { limit, cursor } = params
  const offset = Number.parseInt(cursor, 10) || 0

  const rows = db
    .prepare(`${ARTICLE_SELECT} WHERE a.author_id = ? ORDER BY a.created_at DESC LIMIT ? OFFSET ?`)
    .all(authorId, limit + 1, offset) as unknown as ArticleWithAuthorRow[]

  const hasMore = rows.length > limit
  const list = rows.slice(0, limit).map((row) =>
    toArticleSummary(rowToArticleDetail(row, isArticleLiked(row.id, userId), isArticleCollected(row.id, userId))),
  )

  return { list, cursor: hasMore ? String(offset + limit) : '', hasMore }
}

/** 某用户赞过的文章：按点赞时间倒序游标分页 */
export function listLikedArticles(
  userId: ID,
  params: { limit: number; cursor: string },
  viewerId: ID | null,
): CursorPage<ArticleSummary> {
  const { limit, cursor } = params
  const offset = Number.parseInt(cursor, 10) || 0

  const rows = db
    .prepare(
      `${ARTICLE_SELECT} JOIN article_likes al ON al.article_id = a.id AND al.user_id = ? ORDER BY a.created_at DESC LIMIT ? OFFSET ?`,
    )
    .all(userId, limit + 1, offset) as unknown as ArticleWithAuthorRow[]

  const hasMore = rows.length > limit
  const list = rows.slice(0, limit).map((row) =>
    toArticleSummary(rowToArticleDetail(row, isArticleLiked(row.id, viewerId), isArticleCollected(row.id, viewerId))),
  )

  return { list, cursor: hasMore ? String(offset + limit) : '', hasMore }
}

/* ============================== 交互：点赞 / 收藏 ============================== */

export interface LikeResult {
  liked: boolean
  likeCount: number
}

export function toggleArticleLike(articleId: ID, userId: ID): LikeResult {
  const existing = db
    .prepare('SELECT 1 AS v FROM article_likes WHERE article_id = ? AND user_id = ?')
    .get(articleId, userId) as { v: number } | undefined

  if (existing) {
    db.prepare('DELETE FROM article_likes WHERE article_id = ? AND user_id = ?').run(articleId, userId)
    db.prepare('UPDATE articles SET like_count = MAX(0, like_count - 1) WHERE id = ?').run(articleId)
  } else {
    db.prepare('INSERT OR IGNORE INTO article_likes (article_id, user_id) VALUES (?, ?)').run(articleId, userId)
    db.prepare('UPDATE articles SET like_count = like_count + 1 WHERE id = ?').run(articleId)
  }

  const row = db.prepare('SELECT like_count FROM articles WHERE id = ?').get(articleId) as { like_count: number }
  return { liked: !existing, likeCount: row.like_count }
}

export interface CollectResult {
  collected: boolean
  collectCount: number
}

export function toggleArticleCollect(articleId: ID, userId: ID): CollectResult {
  const existing = db
    .prepare('SELECT 1 AS v FROM article_collects WHERE article_id = ? AND user_id = ?')
    .get(articleId, userId) as { v: number } | undefined

  if (existing) {
    db.prepare('DELETE FROM article_collects WHERE article_id = ? AND user_id = ?').run(articleId, userId)
    db.prepare('UPDATE articles SET collect_count = MAX(0, collect_count - 1) WHERE id = ?').run(articleId)
  } else {
    db.prepare('INSERT OR IGNORE INTO article_collects (article_id, user_id) VALUES (?, ?)').run(articleId, userId)
    db.prepare('UPDATE articles SET collect_count = collect_count + 1 WHERE id = ?').run(articleId)
  }

  const row = db.prepare('SELECT collect_count FROM articles WHERE id = ?').get(articleId) as { collect_count: number }
  return { collected: !existing, collectCount: row.collect_count }
}

/* ============================== 发布：文章 ============================== */

let articleSeq = 0

export function createArticle(
  params: {
    title: string
    content: string
    brief: string
    cover: string
    categoryId: string
    tags: string[]
  },
  authorId: ID,
): ArticleSummary {
  articleSeq += 1
  const id = `article_new_${Date.now().toString(36)}_${articleSeq}`
  const createdAt = new Date().toISOString()

  const author = db.prepare('SELECT * FROM users WHERE id = ?').get(authorId) as UserRow | undefined
  if (!author) throw new Error('用户不存在')

  db.prepare(
    `INSERT INTO articles (id, title, brief, cover, category_id, tags, author_id, view_count, like_count, comment_count, collect_count, created_at, is_hot, content)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, ?, 0, ?)`,
  ).run(
    id,
    params.title,
    params.brief,
    params.cover,
    params.categoryId,
    JSON.stringify(params.tags),
    authorId,
    createdAt,
    params.content,
  )

  db.prepare('UPDATE users SET article_count = article_count + 1 WHERE id = ?').run(authorId)

  const detail = getArticleById(id, authorId)
  if (!detail) throw new Error('文章创建失败')
  return toArticleSummary(detail)
}
