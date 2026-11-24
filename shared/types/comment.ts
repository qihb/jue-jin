import type { CursorQuery, ID } from './common'
import type { UserBrief } from './user'

/** 评论挂载的目标类型 */
export type CommentTargetType = 'article' | 'pin'

/** 评论（children 为一层回复） */
export interface Comment {
  id: ID
  /** 挂载目标的类型 */
  targetType: CommentTargetType
  /** 挂载目标的 id */
  targetId: ID
  content: string
  author: UserBrief
  /** 被回复的评论 id，顶层评论为 null */
  replyTo: ID | null
  /** 被回复人昵称，顶层评论为空字符串 */
  replyToName: string
  /** 点赞数 */
  likeCount: number
  /** 当前登录用户是否已点赞 */
  liked: boolean
  /** 发布时间（ISO） */
  createdAt: string
  /** 子评论（一层回复） */
  children: Comment[]
}

/** 评论列表查询参数 */
export interface CommentListQuery extends CursorQuery {
  targetType: CommentTargetType
  targetId: ID
}
