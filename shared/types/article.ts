import type { CursorQuery, ID } from './common'
import type { UserBrief } from './user'

/** 文章列表项 */
export interface ArticleSummary {
  id: ID
  title: string
  /** 纯文本摘要 */
  brief: string
  /** 封面图地址，空字符串表示无封面 */
  cover: string
  /** 归属分类 id，对应 Category.id */
  categoryId: string
  /** 标签名列表（不含 #） */
  tags: string[]
  author: UserBrief
  /** 阅读数 */
  viewCount: number
  /** 点赞数 */
  likeCount: number
  /** 评论数 */
  commentCount: number
  /** 收藏数 */
  collectCount: number
  /** 发布时间（ISO） */
  createdAt: string
  /** 是否上首页推荐 / 精华 */
  isHot: boolean
}

/** 文章详情（含正文与当前登录用户的交互态） */
export interface ArticleDetail extends ArticleSummary {
  /** Markdown 正文 */
  content: string
  /** 当前登录用户是否已点赞 */
  liked: boolean
  /** 当前登录用户是否已收藏 */
  collected: boolean
}

/** 文章流查询参数 */
export interface ArticleFeedQuery extends CursorQuery {
  /** 分类 id；`recommend` 为推荐流，缺省等同 recommend */
  category?: string
}
