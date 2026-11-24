import type { CursorPage, ID, PinDetail } from '~~/shared/types'
import type { LikeResult } from './article'
import { db } from '../schema'
import { isFollowing, type UserRow } from './user'

/* ============================== 行 → 领域对象映射 ============================== */

interface PinRow {
  id: string
  content: string
  images: string
  topics: string
  author_id: string
  like_count: number
  comment_count: number
  created_at: string
}

interface PinWithAuthorRow extends PinRow {
  username: string
  nickname: string
  avatar: string
  level: number
  description: string
}

function rowToPinDetail(row: PinWithAuthorRow, liked: boolean, following = false): PinDetail {
  return {
    id: row.id,
    content: row.content,
    images: JSON.parse(row.images) as string[],
    topics: JSON.parse(row.topics) as string[],
    author: {
      id: row.author_id,
      username: row.username,
      nickname: row.nickname,
      avatar: row.avatar,
      level: row.level,
      description: row.description,
    },
    likeCount: row.like_count,
    commentCount: row.comment_count,
    createdAt: row.created_at,
    liked,
    following,
  }
}

/* ============================== 关系表查询：当前用户交互态 ============================== */

function isPinLiked(pinId: ID, userId: ID | null): boolean {
  if (!userId) return false
  const row = db
    .prepare('SELECT 1 AS v FROM pin_likes WHERE pin_id = ? AND user_id = ?')
    .get(pinId, userId) as { v: number } | undefined
  return !!row
}

/* ============================== 沸点 ============================== */

const PIN_SELECT = `
  SELECT p.*, u.username, u.nickname, u.avatar, u.level, u.description
  FROM pins p
  JOIN users u ON u.id = p.author_id
`

export function listPins(
  params: { sort: 'recommend' | 'newest' | 'follow'; limit: number; cursor: string },
  userId: ID | null,
): CursorPage<PinDetail> {
  const { sort, limit, cursor } = params
  const offset = Number.parseInt(cursor, 10) || 0

  const order =
    sort === 'newest'
      ? 'ORDER BY p.created_at DESC'
      : sort === 'follow'
        ? 'ORDER BY p.created_at DESC'
        : 'ORDER BY p.like_count DESC, p.created_at DESC'

  let rows: PinWithAuthorRow[]

  // 关注流：仅返回关注作者的沸点
  if (sort === 'follow') {
    if (!userId) {
      return { list: [], cursor: '', hasMore: false }
    }
    rows = db
      .prepare(
        `${PIN_SELECT} JOIN follows f ON f.followee_id = p.author_id AND f.follower_id = ? ${order} LIMIT ? OFFSET ?`,
      )
      .all(userId, limit + 1, offset) as unknown as PinWithAuthorRow[]
  } else {
    rows = db
      .prepare(`${PIN_SELECT} ${order} LIMIT ? OFFSET ?`)
      .all(limit + 1, offset) as unknown as PinWithAuthorRow[]
  }

  const hasMore = rows.length > limit
  const list = rows.slice(0, limit).map((row) => rowToPinDetail(row, isPinLiked(row.id, userId)))

  return { list, cursor: hasMore ? String(offset + limit) : '', hasMore }
}

export function getPinById(id: ID, userId: ID | null): PinDetail | null {
  const row = db.prepare(`${PIN_SELECT} WHERE p.id = ?`).get(id) as PinWithAuthorRow | undefined
  if (!row) return null
  return rowToPinDetail(row, isPinLiked(id, userId), isFollowing(userId, row.author_id))
}

/** 某用户发布的沸点：按时间倒序游标分页 */
export function listPinsByAuthor(
  authorId: ID,
  params: { limit: number; cursor: string },
  userId: ID | null,
): CursorPage<PinDetail> {
  const { limit, cursor } = params
  const offset = Number.parseInt(cursor, 10) || 0

  const rows = db
    .prepare(`${PIN_SELECT} WHERE p.author_id = ? ORDER BY p.created_at DESC LIMIT ? OFFSET ?`)
    .all(authorId, limit + 1, offset) as unknown as PinWithAuthorRow[]

  const hasMore = rows.length > limit
  const list = rows.slice(0, limit).map((row) => rowToPinDetail(row, isPinLiked(row.id, userId)))

  return { list, cursor: hasMore ? String(offset + limit) : '', hasMore }
}

/* ============================== 交互：点赞 ============================== */

export function togglePinLike(pinId: ID, userId: ID): LikeResult {
  const existing = db
    .prepare('SELECT 1 AS v FROM pin_likes WHERE pin_id = ? AND user_id = ?')
    .get(pinId, userId) as { v: number } | undefined

  if (existing) {
    db.prepare('DELETE FROM pin_likes WHERE pin_id = ? AND user_id = ?').run(pinId, userId)
    db.prepare('UPDATE pins SET like_count = MAX(0, like_count - 1) WHERE id = ?').run(pinId)
  } else {
    db.prepare('INSERT OR IGNORE INTO pin_likes (pin_id, user_id) VALUES (?, ?)').run(pinId, userId)
    db.prepare('UPDATE pins SET like_count = like_count + 1 WHERE id = ?').run(pinId)
  }

  const row = db.prepare('SELECT like_count FROM pins WHERE id = ?').get(pinId) as { like_count: number }
  return { liked: !existing, likeCount: row.like_count }
}

/* ============================== 发布：沸点 ============================== */

let pinSeq = 0

/** 发布沸点：返回创建后的沸点详情 */
export function createPin(
  params: { content: string; images: string[]; topics: string[] },
  authorId: ID,
): PinDetail {
  pinSeq += 1
  const id = `pin_new_${Date.now().toString(36)}_${pinSeq}`
  const createdAt = new Date().toISOString()

  const author = db.prepare('SELECT * FROM users WHERE id = ?').get(authorId) as UserRow | undefined
  if (!author) throw new Error('用户不存在')

  db.prepare(
    `INSERT INTO pins (id, content, images, topics, author_id, like_count, comment_count, created_at)
     VALUES (?, ?, ?, ?, ?, 0, 0, ?)`,
  ).run(
    id,
    params.content,
    JSON.stringify(params.images),
    JSON.stringify(params.topics),
    authorId,
    createdAt,
  )

  const detail = getPinById(id, authorId)
  if (!detail) throw new Error('沸点创建失败')
  return detail
}
