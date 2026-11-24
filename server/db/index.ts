import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import type {
  ArticleDetail,
  ArticleSummary,
  AuthorRankItem,
  BookDetail,
  BookSection,
  BookSummary,
  Comment,
  CommentTargetType,
  CursorPage,
  ID,
  PinDetail,
  Tag,
  User,
  UserBrief,
} from '~~/shared/types'
import { generateMockData, toArticleSummary, toUserBrief, type MockData } from '../mock/seed'

/**
 * SQLite 持久化层。
 * 使用 Node 24 内置 `node:sqlite`（零原生依赖），数据文件挂载到宿主机持久化。
 * liked / collected / pin liked 为「当前登录用户」的交互态，存于独立关系表。
 */

const DB_PATH = process.env.SQLITE_PATH || resolve(process.cwd(), 'data/juejin.db')

// 确保数据目录存在（node:sqlite 不会自动创建目录）
mkdirSync(dirname(DB_PATH), { recursive: true })

const db = new DatabaseSync(DB_PATH)
export { db }

/* ============================== 建表 ============================== */

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    nickname TEXT NOT NULL,
    avatar TEXT NOT NULL DEFAULT '',
    level INTEGER NOT NULL DEFAULT 1,
    description TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    job TEXT NOT NULL DEFAULT '',
    company TEXT NOT NULL DEFAULT '',
    power INTEGER NOT NULL DEFAULT 0,
    follow_count INTEGER NOT NULL DEFAULT 0,
    follower_count INTEGER NOT NULL DEFAULT 0,
    liked_count INTEGER NOT NULL DEFAULT 0,
    article_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS articles (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    brief TEXT NOT NULL DEFAULT '',
    cover TEXT NOT NULL DEFAULT '',
    category_id TEXT NOT NULL,
    tags TEXT NOT NULL DEFAULT '[]',
    author_id TEXT NOT NULL,
    view_count INTEGER NOT NULL DEFAULT 0,
    like_count INTEGER NOT NULL DEFAULT 0,
    comment_count INTEGER NOT NULL DEFAULT 0,
    collect_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    is_hot INTEGER NOT NULL DEFAULT 0,
    content TEXT NOT NULL DEFAULT ''
  );
  CREATE INDEX IF NOT EXISTS idx_articles_author ON articles(author_id);
  CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category_id);
  CREATE INDEX IF NOT EXISTS idx_articles_created ON articles(created_at DESC);

  CREATE TABLE IF NOT EXISTS pins (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    images TEXT NOT NULL DEFAULT '[]',
    topics TEXT NOT NULL DEFAULT '[]',
    author_id TEXT NOT NULL,
    like_count INTEGER NOT NULL DEFAULT 0,
    comment_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_pins_created ON pins(created_at DESC);

  CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id TEXT NOT NULL,
    reply_to TEXT,
    reply_to_name TEXT NOT NULL DEFAULT '',
    like_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_comments_target ON comments(target_type, target_id);
  CREATE INDEX IF NOT EXISTS idx_comments_reply ON comments(reply_to);

  CREATE TABLE IF NOT EXISTS article_likes (
    article_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    PRIMARY KEY (article_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS article_collects (
    article_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    PRIMARY KEY (article_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS pin_likes (
    pin_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    PRIMARY KEY (pin_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    icon TEXT NOT NULL DEFAULT '',
    category_id TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    article_count INTEGER NOT NULL DEFAULT 0,
    follower_count INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS books (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    cover TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    author_id TEXT NOT NULL,
    tags TEXT NOT NULL DEFAULT '[]',
    price INTEGER NOT NULL DEFAULT 0,
    finished INTEGER NOT NULL DEFAULT 0,
    section_count INTEGER NOT NULL DEFAULT 0,
    learner_count INTEGER NOT NULL DEFAULT 0,
    collect_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    sections TEXT NOT NULL DEFAULT '[]'
  );
  CREATE INDEX IF NOT EXISTS idx_books_created ON books(created_at DESC);
`)

/* ============================== 种子数据 ============================== */

const userCount = (db.prepare('SELECT COUNT(*) AS c FROM users').get() as { c: number }).c
const bookCount = (db.prepare('SELECT COUNT(*) AS c FROM books').get() as { c: number }).c

// 老库可能在新增小册表前已灌过种子：此时只补灌小册，不动既有数据
if (userCount === 0 || bookCount === 0) {
  const data = generateMockData()
  if (userCount === 0) seedDatabase(data)
  if (bookCount === 0) seedBooks(data.books)
}

function seedDatabase(data: MockData) {
  db.exec('BEGIN')

  const insertUser = db.prepare(
    `INSERT INTO users (id, username, nickname, avatar, level, description, email, job, company, power, follow_count, follower_count, liked_count, article_count, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
  for (const u of data.users) {
    insertUser.run(
      u.id,
      u.username,
      u.nickname,
      u.avatar,
      u.level,
      u.description,
      u.email,
      u.job,
      u.company,
      u.power,
      u.followCount,
      u.followerCount,
      u.likedCount,
      u.articleCount,
      u.createdAt,
    )
  }

  const insertArticle = db.prepare(
    `INSERT INTO articles (id, title, brief, cover, category_id, tags, author_id, view_count, like_count, comment_count, collect_count, created_at, is_hot, content)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
  for (const a of data.articles) {
    insertArticle.run(
      a.id,
      a.title,
      a.brief,
      a.cover,
      a.categoryId,
      JSON.stringify(a.tags),
      a.author.id,
      a.viewCount,
      a.likeCount,
      a.commentCount,
      a.collectCount,
      a.createdAt,
      a.isHot ? 1 : 0,
      a.content,
    )
  }

  const insertPin = db.prepare(
    `INSERT INTO pins (id, content, images, topics, author_id, like_count, comment_count, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  )
  for (const p of data.pins) {
    insertPin.run(
      p.id,
      p.content,
      JSON.stringify(p.images),
      JSON.stringify(p.topics),
      p.author.id,
      p.likeCount,
      p.commentCount,
      p.createdAt,
    )
  }

  const insertComment = db.prepare(
    `INSERT INTO comments (id, target_type, target_id, content, author_id, reply_to, reply_to_name, like_count, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
  for (const c of data.comments) {
    insertComment.run(
      c.id,
      c.targetType,
      c.targetId,
      c.content,
      c.author.id,
      c.replyTo,
      c.replyToName,
      c.likeCount,
      c.createdAt,
    )
    for (const child of c.children) {
      insertComment.run(
        child.id,
        child.targetType,
        child.targetId,
        child.content,
        child.author.id,
        child.replyTo,
        child.replyToName,
        child.likeCount,
        child.createdAt,
      )
    }
  }

  const insertTag = db.prepare(
    `INSERT INTO tags (id, name, icon, category_id, description, article_count, follower_count)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  )
  for (const t of data.tags) {
    insertTag.run(t.id, t.name, t.icon, t.categoryId, t.description, t.articleCount, t.followerCount)
  }

  db.exec('COMMIT')
}

function seedBooks(books: BookDetail[]) {
  db.exec('BEGIN')

  const insertBook = db.prepare(
    `INSERT INTO books (id, title, cover, description, author_id, tags, price, finished, section_count, learner_count, collect_count, created_at, sections)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
  for (const book of books) {
    insertBook.run(
      book.id,
      book.title,
      book.cover,
      book.description,
      book.author.id,
      JSON.stringify(book.tags),
      book.price,
      book.finished ? 1 : 0,
      book.sectionCount,
      book.learnerCount,
      book.collectCount,
      book.createdAt,
      JSON.stringify(book.sections),
    )
  }

  db.exec('COMMIT')
}

/* ============================== 行 → 领域对象映射 ============================== */

interface UserRow {
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
}

function rowToUser(row: UserRow): User {
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
interface ArticleWithAuthorRow extends ArticleRow {
  username: string
  nickname: string
  avatar: string
  level: number
  description: string
}

function rowToArticleDetail(row: ArticleWithAuthorRow, liked: boolean, collected: boolean): ArticleDetail {
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
  }
}

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

function rowToPinDetail(row: PinWithAuthorRow, liked: boolean): PinDetail {
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
  }
}

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

/* ============================== 关系表查询：当前用户交互态 ============================== */

function isArticleLiked(articleId: ID, userId: ID | null): boolean {
  if (!userId) return false
  const row = db
    .prepare('SELECT 1 AS v FROM article_likes WHERE article_id = ? AND user_id = ?')
    .get(articleId, userId) as { v: number } | undefined
  return !!row
}

function isArticleCollected(articleId: ID, userId: ID | null): boolean {
  if (!userId) return false
  const row = db
    .prepare('SELECT 1 AS v FROM article_collects WHERE article_id = ? AND user_id = ?')
    .get(articleId, userId) as { v: number } | undefined
  return !!row
}

function isPinLiked(pinId: ID, userId: ID | null): boolean {
  if (!userId) return false
  const row = db
    .prepare('SELECT 1 AS v FROM pin_likes WHERE pin_id = ? AND user_id = ?')
    .get(pinId, userId) as { v: number } | undefined
  return !!row
}

/* ============================== 文章 ============================== */

const ARTICLE_SELECT = `
  SELECT a.*, u.username, u.nickname, u.avatar, u.level, u.description
  FROM articles a
  JOIN users u ON u.id = a.author_id
`

/** 文章流：按分类过滤 + 游标分页（cursor = 偏移量） */
export function listArticles(
  params: { category: string; limit: number; cursor: string },
  userId: ID | null,
): CursorPage<ArticleSummary> {
  const { category, limit, cursor } = params
  const offset = Number.parseInt(cursor, 10) || 0

  const isAggregate = category === 'recommend' || category === 'follow'
  const where = isAggregate ? '' : 'WHERE a.category_id = ?'
  const order = 'ORDER BY a.created_at DESC'

  const rows = db
    .prepare(`${ARTICLE_SELECT} ${where} ${order} LIMIT ? OFFSET ?`)
    .all(...(isAggregate ? [limit + 1, offset] : [category, limit + 1, offset])) as unknown as ArticleWithAuthorRow[]

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
  return rowToArticleDetail(row, isArticleLiked(id, userId), isArticleCollected(id, userId))
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

/* ============================== 沸点 ============================== */

const PIN_SELECT = `
  SELECT p.*, u.username, u.nickname, u.avatar, u.level, u.description
  FROM pins p
  JOIN users u ON u.id = p.author_id
`

export function listPins(
  params: { limit: number; cursor: string },
  userId: ID | null,
): CursorPage<PinDetail> {
  const { limit, cursor } = params
  const offset = Number.parseInt(cursor, 10) || 0

  const rows = db
    .prepare(`${PIN_SELECT} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`)
    .all(limit + 1, offset) as unknown as PinWithAuthorRow[]

  const hasMore = rows.length > limit
  const list = rows.slice(0, limit).map((row) => rowToPinDetail(row, isPinLiked(row.id, userId)))

  return { list, cursor: hasMore ? String(offset + limit) : '', hasMore }
}

export function getPinById(id: ID, userId: ID | null): PinDetail | null {
  const row = db.prepare(`${PIN_SELECT} WHERE p.id = ?`).get(id) as PinWithAuthorRow | undefined
  if (!row) return null
  return rowToPinDetail(row, isPinLiked(id, userId))
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

interface TagRow {
  id: string
  name: string
  icon: string
  category_id: string
  description: string
  article_count: number
  follower_count: number
}

/** 标签行 → 领域对象（表字段为 snake_case，需显式映射） */
function rowToTag(row: TagRow): Tag {
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

/* ============================== 小册 ============================== */

const BOOK_SELECT = `
  SELECT b.*, u.username, u.nickname, u.avatar, u.level, u.description
  FROM books b
  JOIN users u ON u.id = b.author_id
`

interface BookRow {
  id: string
  title: string
  cover: string
  description: string
  author_id: string
  tags: string
  price: number
  finished: number
  section_count: number
  learner_count: number
  collect_count: number
  created_at: string
  sections: string
}

interface BookWithAuthorRow extends BookRow {
  username: string
  nickname: string
  avatar: string
  level: number
  description: string
}

function rowToBookDetail(row: BookWithAuthorRow): BookDetail {
  return {
    id: row.id,
    title: row.title,
    cover: row.cover,
    description: row.description,
    author: {
      id: row.author_id,
      username: row.username,
      nickname: row.nickname,
      avatar: row.avatar,
      level: row.level,
      description: row.description,
    },
    tags: JSON.parse(row.tags) as string[],
    price: row.price,
    finished: row.finished === 1,
    sectionCount: row.section_count,
    learnerCount: row.learner_count,
    collectCount: row.collect_count,
    createdAt: row.created_at,
    sections: JSON.parse(row.sections) as BookSection[],
  }
}

/** 小册详情 → 列表项（剥离章节目录） */
function toBookSummary(book: BookDetail): BookSummary {
  return {
    id: book.id,
    title: book.title,
    cover: book.cover,
    description: book.description,
    author: book.author,
    tags: book.tags,
    price: book.price,
    finished: book.finished,
    sectionCount: book.sectionCount,
    learnerCount: book.learnerCount,
    collectCount: book.collectCount,
    createdAt: book.createdAt,
  }
}

export function listBooks(params: { limit: number; cursor: string }): CursorPage<BookSummary> {
  const { limit, cursor } = params
  const offset = Number.parseInt(cursor, 10) || 0

  const rows = db
    .prepare(`${BOOK_SELECT} ORDER BY b.created_at DESC LIMIT ? OFFSET ?`)
    .all(limit + 1, offset) as unknown as BookWithAuthorRow[]

  const hasMore = rows.length > limit
  const list = rows.slice(0, limit).map((row) => toBookSummary(rowToBookDetail(row)))

  return { list, cursor: hasMore ? String(offset + limit) : '', hasMore }
}

export function getBookById(id: ID): BookDetail | null {
  const row = db.prepare(`${BOOK_SELECT} WHERE b.id = ?`).get(id) as BookWithAuthorRow | undefined
  return row ? rowToBookDetail(row) : null
}

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

/* ============================== 发布：评论 / 文章 ============================== */

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
