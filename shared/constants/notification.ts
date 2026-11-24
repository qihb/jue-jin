import type { NotificationTab, NotificationUnread } from '../types'

/** 消息中心分类 Tab */
export const NOTIFICATION_TABS: readonly {
  id: NotificationTab
  name: string
  icon: string
}[] = [
  { id: 'like', name: '赞和收藏', icon: 'i-lucide:thumbs-up' },
  { id: 'comment', name: '评论', icon: 'i-lucide:message-square' },
  { id: 'mention', name: '@我', icon: 'i-lucide:at-sign' },
  { id: 'follow', name: '关注', icon: 'i-lucide:user-plus' },
  { id: 'system', name: '系统', icon: 'i-lucide:bell' },
]

/** 默认消息分类 */
export const DEFAULT_NOTIFICATION_TAB: NotificationTab = 'like'

/** 校验是否为合法的消息分类 */
export function isNotificationTab(value: unknown): value is NotificationTab {
  return typeof value === 'string' && NOTIFICATION_TABS.some((tab) => tab.id === value)
}

/** 取分类展示名（未知分类回退为空串） */
export function getNotificationTabName(id: NotificationTab): string {
  return NOTIFICATION_TABS.find((tab) => tab.id === id)?.name ?? ''
}

/** 空未读统计：未登录或暂无数据时的兜底值 */
export function emptyNotificationUnread(): NotificationUnread {
  return {
    total: 0,
    byTab: { like: 0, comment: 0, mention: 0, follow: 0, system: 0 },
  }
}
