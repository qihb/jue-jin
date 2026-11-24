import type { Comment, CommentTargetType, CursorPage, ID } from '~~/shared/types'
import { toUserBrief } from '../../mock/seed'
import { db } from '../schema'
import { rowToUser, type UserRow } from './user'

/* ============================== 行 → 领域对象映射 ============================== */

interface CommentRow {
  id: string
  target_type: string
  target_id: string
  content: string
  author_id: string
  reply_to: string | null
  reply_to_name: string
  like_count: number
  created_at: string
}

interface CommentWithAuthorRow extends CommentRow {
  username: string
  nickname: string
  avatar: string
  level: number
  description: string
}

function rowToComment(row: CommentWithAuthorRow, liked: boolean): Comment {
  return {
    id: row.id,
    targetType: row.target_type as CommentTargetType,
    targetId: row.target_id,
    content: row.content,
    author: {
      id: row.author_id,
      username: row.username,
      nickname: row.nickname,
      avatar: row.avatar,
      level: row.level,
      description: row.description,
    },
    replyTo: row.reply_to,
    replyToName: row.reply_to_name,
    likeCount: row.like_count,
    liked,
    createdAt: row.created_at,
    children: [],
  }
}

/* ============================== 评论 ============================== */

const COMMENT_SELECT = `
  SELECT c.*, u.username, u.nickname, u.avatar, u.level, u.description
  FROM comments c
  JOIN users u ON u.id = c.author_id
`

export function listComments(
  params: { targetType: CommentTargetType; targetId: ID; limit: number; cursor: string },
  _userId: ID | null,
): CursorPage<Comment> {
  const { targetType, targetId, limit, cursor } = params
  const offset = Number.parseInt(cursor, 10) || 0

  // 顶层评论（reply_to IS NULL）分页，子评论一次性查出后组装
  const topRows = db
    .prepare(
      `${COMMENT_SELECT} WHERE c.target_type = ? AND c.target_id = ? AND c.reply_to IS NULL ORDER BY c.created_at DESC LIMIT ? OFFSET ?`,
    )
    .all(targetType, targetId, limit + 1, offset) as unknown as CommentWithAuthorRow[]

  const hasMore = topRows.length > limit
  const topList = topRows.slice(0, limit)

  if (topList.length === 0) {
    return { list: [], cursor: '', hasMore: false }
  }

  const topIds = topList.map((row) => row.id)
  const placeholders = topIds.map(() => '?').join(',')
  const childRows = db
    .prepare(
      `${COMMENT_SELECT} WHERE c.reply_to IN (${placeholders}) ORDER BY c.created_at ASC`,
    )
    .all(...topIds) as unknown as CommentWithAuthorRow[]

  const childrenByParent = new Map<string, Comment[]>()
  for (const row of childRows) {
    if (!row.reply_to) continue
    const list = childrenByParent.get(row.reply_to) ?? []
    list.push(rowToComment(row, false))
    childrenByParent.set(row.reply_to, list)
  }

  const list = topList.map((row) => ({
    ...rowToComment(row, false),
    children: childrenByParent.get(row.id) ?? [],
  }))

  return { list, cursor: hasMore ? String(offset + limit) : '', hasMore }
}

/* ============================== 发布：评论 ============================== */

let commentSeq = 0

export function createComment(params: {
  targetType: CommentTargetType
  targetId: ID
  content: string
  authorId: ID
}): Comment {
  commentSeq += 1
  const id = `comment_new_${Date.now().toString(36)}_${commentSeq}`
  const createdAt = new Date().toISOString()

  const author = db.prepare('SELECT * FROM users WHERE id = ?').get(params.authorId) as UserRow | undefined
  if (!author) throw new Error('用户不存在')

  db.prepare(
    `INSERT INTO comments (id, target_type, target_id, content, author_id, reply_to, reply_to_name, like_count, created_at)
     VALUES (?, ?, ?, ?, ?, NULL, '', 0, ?)`,
  ).run(id, params.targetType, params.targetId, params.content, params.authorId, createdAt)

  // 同步目标的评论数
  if (params.targetType === 'article') {
    db.prepare('UPDATE articles SET comment_count = comment_count + 1 WHERE id = ?').run(params.targetId)
  } else {
    db.prepare('UPDATE pins SET comment_count = comment_count + 1 WHERE id = ?').run(params.targetId)
  }

  return {
    id,
    targetType: params.targetType,
    targetId: params.targetId,
    content: params.content,
    author: toUserBrief(rowToUser(author)),
    replyTo: null,
    replyToName: '',
    likeCount: 0,
    liked: false,
    createdAt,
    children: [],
  }
}
