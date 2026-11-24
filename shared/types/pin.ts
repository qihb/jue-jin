import type { ID } from './common'
import type { UserBrief } from './user'

/** 沸点（短内容）列表项 */
export interface PinSummary {
  id: ID
  /** 正文 */
  content: string
  /** 配图地址列表 */
  images: string[]
  /** 关联话题（不含 #） */
  topics: string[]
  author: UserBrief
  /** 点赞数 */
  likeCount: number
  /** 评论数 */
  commentCount: number
  /** 发布时间（ISO） */
  createdAt: string
}

/** 沸点详情（含当前登录用户的交互态） */
export interface PinDetail extends PinSummary {
  /** 当前登录用户是否已点赞 */
  liked: boolean
  /** 当前登录用户是否已关注作者 */
  following: boolean
}

/** 沸点点赞结果 */
export interface PinLikeResult {
  liked: boolean
  likeCount: number
}

/** 发布沸点入参 */
export interface PinPublishPayload {
  /** 正文（必填） */
  content: string
  /** 配图地址列表（走 URL 输入，最多 9 张） */
  images: string[]
  /** 关联话题（不含 #，最多 5 个） */
  topics: string[]
}
