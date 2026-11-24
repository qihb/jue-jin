import type { ArticleSummary } from './article'
import type { CursorPage, ID } from './common'

/** 内容分类（首页 Tab） */
export interface Category {
  id: string
  name: string
}

/** 标签 */
export interface Tag {
  id: ID
  /** 标签名（不含 #） */
  name: string
  /** 标签图标（Iconify 图标名） */
  icon: string
  /** 归属分类 id，对应 Category.id */
  categoryId: string
  /** 标签简介 */
  description: string
  /** 关联文章数 */
  articleCount: number
  /** 关注人数 */
  followerCount: number
}

/** 标签详情：标签信息 + 标签下的文章流（游标分页） */
export interface TagDetail {
  tag: Tag
  articles: CursorPage<ArticleSummary>
}
