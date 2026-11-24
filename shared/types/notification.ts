import type { ID } from './common'
import type { UserBrief } from './user'

/** 消息中心分类 */
export type NotificationTab = 'like' | 'comment' | 'mention' | 'follow' | 'system'

/** 消息指向的内容类型（system 类消息无目标） */
export type NotificationTargetType = 'article' | 'pin' | 'none'

/** 单条消息 */
export interface NotificationItem {
  id: ID
  tab: NotificationTab
  /** 触发者，系统消息为 null */
  actor: UserBrief | null
  /** 标题（系统消息直接给出标题，其余为动作描述） */
  title: string
  /** 摘要内容 */
  content: string
  targetType: NotificationTargetType
  /** 指向的内容 id，targetType 为 none 时为空字符串 */
  targetId: ID
  /** 是否已读 */
  read: boolean
  /** 时间（ISO） */
  createdAt: string
}

/** 未读数统计 */
export interface NotificationUnread {
  /** 未读总数 */
  total: number
  /** 各分类未读数 */
  byTab: Record<NotificationTab, number>
}
