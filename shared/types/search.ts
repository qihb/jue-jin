import type { ArticleSummary } from './article'
import type { BookSummary } from './book'
import type { Tag } from './tag'
import type { UserBrief } from './user'

/** 搜索分类：综合 / 文章 / 用户 / 标签 / 小册 */
export type SearchType = 'all' | 'article' | 'user' | 'tag' | 'book'

export interface SearchArticleItem {
  type: 'article'
  article: ArticleSummary
}

export interface SearchUserItem {
  type: 'user'
  user: UserBrief
}

export interface SearchTagItem {
  type: 'tag'
  tag: Tag
}

export interface SearchBookItem {
  type: 'book'
  book: BookSummary
}

/** 搜索结果项（按 type 区分的联合类型，前端据此选择渲染方式） */
export type SearchItem = SearchArticleItem | SearchUserItem | SearchTagItem | SearchBookItem
