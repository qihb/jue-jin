import type { ArticleSummary } from './article'
import type { CursorPage, ID } from './common'

/** 收藏集（收藏夹）概要 */
export interface CollectionSummary {
  id: ID
  name: string
  description: string
  cover: string
  /** 收藏集内文章数 */
  articleCount: number
  /** 最近更新时间（ISO） */
  updatedAt: string
  createdAt: string
}

/** 收藏集详情：概要 + 文章列表（游标分页） */
export interface CollectionDetail {
  collection: CollectionSummary
  articles: CursorPage<ArticleSummary>
}
