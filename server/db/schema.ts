import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import type { BookDetail } from '~~/shared/types'
import {
  generateMockData,
  type CollectionRecord,
  type MockData,
  type NotificationRecord,
} from '../mock/seed'

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
    created_at TEXT NOT NULL,
    password_hash TEXT NOT NULL DEFAULT ''
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

  CREATE TABLE IF NOT EXISTS follows (
    follower_id TEXT NOT NULL,
    followee_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    PRIMARY KEY (follower_id, followee_id)
  );
  CREATE INDEX IF NOT EXISTS idx_follows_followee ON follows(followee_id);

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

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    tab TEXT NOT NULL,
    actor_id TEXT,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    target_type TEXT NOT NULL DEFAULT 'none',
    target_id TEXT NOT NULL DEFAULT '',
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, tab, created_at DESC);

  CREATE TABLE IF NOT EXISTS collections (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    cover TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_collections_user ON collections(user_id, updated_at DESC);

  CREATE TABLE IF NOT EXISTS collection_articles (
    collection_id TEXT NOT NULL,
    article_id TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (collection_id, article_id)
  );
`)

/* ============================== 幂等迁移 ============================== */

// 老库的 users 表在新增列之前已建好：CREATE TABLE IF NOT EXISTS 不会补列，需显式迁移
const userColumns = db.prepare('PRAGMA table_info(users)').all() as unknown as { name: string }[]
if (!userColumns.some((column) => column.name === 'password_hash')) {
  db.exec(`ALTER TABLE users ADD COLUMN password_hash TEXT NOT NULL DEFAULT ''`)
}

/* ============================== 种子数据 ============================== */

const userCount = (db.prepare('SELECT COUNT(*) AS c FROM users').get() as { c: number }).c
const bookCount = (db.prepare('SELECT COUNT(*) AS c FROM books').get() as { c: number }).c
const notificationCount = (db.prepare('SELECT COUNT(*) AS c FROM notifications').get() as { c: number })
  .c
const collectionCount = (db.prepare('SELECT COUNT(*) AS c FROM collections').get() as { c: number }).c

// 老库可能在新增表前已灌过种子：此时只补灌缺失的表，不动既有数据
if (
  userCount === 0 ||
  bookCount === 0 ||
  notificationCount === 0 ||
  collectionCount === 0
) {
  const data = generateMockData()
  if (userCount === 0) seedDatabase(data)
  if (bookCount === 0) seedBooks(data.books)
  if (notificationCount === 0) seedNotifications(data.notifications)
  if (collectionCount === 0) seedCollections(data.collections)
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

function seedNotifications(records: NotificationRecord[]) {
  db.exec('BEGIN')

  const insert = db.prepare(
    `INSERT INTO notifications (id, user_id, tab, actor_id, title, content, target_type, target_id, is_read, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
  for (const item of records) {
    insert.run(
      item.id,
      item.userId,
      item.tab,
      item.actor ? item.actor.id : null,
      item.title,
      item.content,
      item.targetType,
      item.targetId,
      item.read ? 1 : 0,
      item.createdAt,
    )
  }

  db.exec('COMMIT')
}

function seedCollections(records: CollectionRecord[]) {
  db.exec('BEGIN')

  const insertCollection = db.prepare(
    `INSERT INTO collections (id, user_id, name, description, cover, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  )
  const insertItem = db.prepare(
    `INSERT OR IGNORE INTO collection_articles (collection_id, article_id, sort_order) VALUES (?, ?, ?)`,
  )
  for (const item of records) {
    insertCollection.run(
      item.id,
      item.userId,
      item.name,
      item.description,
      item.cover,
      item.createdAt,
      item.updatedAt,
    )
    item.articleIds.forEach((articleId, index) => {
      insertItem.run(item.id, articleId, index)
    })
  }

  db.exec('COMMIT')
}
