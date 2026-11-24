import type { BookDetail, BookSection, BookSummary, CursorPage, ID } from '~~/shared/types'
import { db } from '../schema'

/* ============================== 小册 ============================== */

export const BOOK_SELECT = `
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

export interface BookWithAuthorRow extends BookRow {
  username: string
  nickname: string
  avatar: string
  level: number
  description: string
}

export function rowToBookDetail(row: BookWithAuthorRow): BookDetail {
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
export function toBookSummary(book: BookDetail): BookSummary {
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
