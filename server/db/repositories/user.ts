import type {
  AuthorRankItem,
  CursorPage,
  FollowState,
  ID,
  User,
  UserBrief,
} from '~~/shared/types'
import { toUserBrief } from '../../mock/seed'
import { db } from '../schema'

/* ============================== 行 → 领域对象映射 ============================== */

export interface UserRow {
  id: string
  username: string
  nickname: string
  avatar: string
  level: number
  description: string
  email: string
  job: string
  company: string
  power: number
  follow_count: number
  follower_count: number
  liked_count: number
  article_count: number
  created_at: string
  password_hash: string
}

export function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    username: row.username,
    nickname: row.nickname,
    avatar: row.avatar,
    level: row.level,
    description: row.description,
    email: row.email,
    job: row.job,
    company: row.company,
    power: row.power,
    followCount: row.follow_count,
    followerCount: row.follower_count,
    likedCount: row.liked_count,
    articleCount: row.article_count,
    createdAt: row.created_at,
  }
}

/* ============================== 用户 ============================== */

export function getUserById(id: ID): User | null {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow | undefined
  return row ? rowToUser(row) : null
}

export function getUserByUsername(username: string): User | null {
  const row = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as UserRow | undefined
  return row ? rowToUser(row) : null
}

export function listAuthorRank(): AuthorRankItem[] {
  const rows = db
    .prepare('SELECT * FROM users ORDER BY power DESC LIMIT 10')
    .all() as unknown as UserRow[]
  return rows.map((row, index) => ({
    rank: index + 1,
    user: toUserBrief(rowToUser(row)),
    power: row.power,
    trend: Math.floor((row.power + index * 37) % 500),
  }))
}

/* ============================== 关注 ============================== */

/** 是否已关注（未登录恒为 false） */
export function isFollowing(followerId: ID | null, followeeId: ID): boolean {
  if (!followerId) return false
  const row = db
    .prepare('SELECT 1 AS v FROM follows WHERE follower_id = ? AND followee_id = ?')
    .get(followerId, followeeId) as { v: number } | undefined
  return !!row
}

/** 某用户的关注列表：按关注时间倒序游标分页 */
export function listFollowings(
  userId: ID,
  params: { limit: number; cursor: string },
): CursorPage<UserBrief> {
  const { limit, cursor } = params
  const offset = Number.parseInt(cursor, 10) || 0

  const rows = db
    .prepare(
      `SELECT u.* FROM follows f JOIN users u ON u.id = f.followee_id
       WHERE f.follower_id = ? ORDER BY f.created_at DESC LIMIT ? OFFSET ?`,
    )
    .all(userId, limit + 1, offset) as unknown as UserRow[]

  const hasMore = rows.length > limit
  const list = rows.slice(0, limit).map((row) => toUserBrief(rowToUser(row)))

  return { list, cursor: hasMore ? String(offset + limit) : '', hasMore }
}

/** 关注 / 取关：同步维护双方关注数，返回目标用户的最新关注态 */
export function toggleFollow(followerId: ID, followeeId: ID): FollowState {
  const followerCountOf = (): number =>
    (db.prepare('SELECT follower_count FROM users WHERE id = ?').get(followeeId) as { follower_count: number })
      .follower_count

  // 不允许关注自己：直接返回当前态
  if (followerId === followeeId) {
    return { userId: followeeId, following: false, followerCount: followerCountOf() }
  }

  const existing = db
    .prepare('SELECT 1 AS v FROM follows WHERE follower_id = ? AND followee_id = ?')
    .get(followerId, followeeId) as { v: number } | undefined

  if (existing) {
    db.prepare('DELETE FROM follows WHERE follower_id = ? AND followee_id = ?').run(followerId, followeeId)
    db.prepare('UPDATE users SET follower_count = MAX(0, follower_count - 1) WHERE id = ?').run(followeeId)
    db.prepare('UPDATE users SET follow_count = MAX(0, follow_count - 1) WHERE id = ?').run(followerId)
  } else {
    db.prepare('INSERT OR IGNORE INTO follows (follower_id, followee_id, created_at) VALUES (?, ?, ?)').run(
      followerId,
      followeeId,
      new Date().toISOString(),
    )
    db.prepare('UPDATE users SET follower_count = follower_count + 1 WHERE id = ?').run(followeeId)
    db.prepare('UPDATE users SET follow_count = follow_count + 1 WHERE id = ?').run(followerId)
  }

  return { userId: followeeId, following: !existing, followerCount: followerCountOf() }
}

/* ============================== 用户便捷查询（供登录中间件使用） ============================== */

export function getUserBriefById(id: ID): UserBrief | null {
  const user = getUserById(id)
  return user ? toUserBrief(user) : null
}

/** 创建用户（供演示登录兜底使用） */
export function createUser(params: {
  id: string
  username: string
  nickname: string
  avatar?: string
  level?: number
  description?: string
}): User {
  const now = new Date().toISOString()
  db.prepare(
    `INSERT INTO users (id, username, nickname, avatar, level, description, email, job, company, power, follow_count, follower_count, liked_count, article_count, created_at)
     VALUES (?, ?, ?, ?, ?, ?, '', '', '', 0, 0, 0, 0, 0, ?)`,
  ).run(
    params.id,
    params.username,
    params.nickname,
    params.avatar ?? '',
    params.level ?? 1,
    params.description ?? '',
    now,
  )
  const user = getUserById(params.id)
  if (!user) throw new Error('用户创建失败')
  return user
}

/** 注册建号：用户名 + 昵称 + 密码哈希（密码哈希由上层 `server/utils/password` 生成） */
export function createUserWithPassword(params: {
  username: string
  nickname: string
  passwordHash: string
}): User {
  const now = new Date().toISOString()
  const id = `user_new_${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`

  db.prepare(
    `INSERT INTO users (id, username, nickname, avatar, level, description, email, job, company, power, follow_count, follower_count, liked_count, article_count, created_at, password_hash)
     VALUES (?, ?, ?, '', 1, '', '', '', '', 0, 0, 0, 0, 0, ?, ?)`,
  ).run(id, params.username, params.nickname, now, params.passwordHash)

  const user = getUserById(id)
  if (!user) throw new Error('用户创建失败')
  return user
}

/** 取密码哈希（未设置密码时为空串） */
export function getPasswordHash(userId: ID): string | null {
  const row = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(userId) as
    | { password_hash: string }
    | undefined
  return row ? row.password_hash : null
}

/** 修改密码 */
export function updateUserPassword(userId: ID, passwordHash: string): void {
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, userId)
}

/** 更新个人资料：仅覆盖传入的字段，返回更新后的用户 */
export function updateUserProfile(
  userId: ID,
  params: {
    nickname?: string
    avatar?: string
    job?: string
    company?: string
    description?: string
    email?: string
  },
): User | null {
  const current = getUserById(userId)
  if (!current) return null

  db.prepare(
    `UPDATE users SET nickname = ?, avatar = ?, job = ?, company = ?, description = ?, email = ? WHERE id = ?`,
  ).run(
    params.nickname ?? current.nickname,
    params.avatar ?? current.avatar,
    params.job ?? current.job,
    params.company ?? current.company,
    params.description ?? current.description,
    params.email ?? current.email,
    userId,
  )

  return getUserById(userId)
}
