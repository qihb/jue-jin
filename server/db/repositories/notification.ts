import type {
  CursorPage,
  ID,
  NotificationItem,
  NotificationTab,
  NotificationTargetType,
  NotificationUnread,
  UserBrief,
} from '~~/shared/types'
import { emptyNotificationUnread, isNotificationTab } from '~~/shared/constants'
import { db } from '../schema'

/* ============================== 消息通知 ============================== */

const NOTIFICATION_SELECT = `
  SELECT n.*, u.username, u.nickname, u.avatar, u.level, u.description
  FROM notifications n
  LEFT JOIN users u ON u.id = n.actor_id
`

interface NotificationRow {
  id: string
  user_id: string
  tab: string
  actor_id: string | null
  title: string
  content: string
  target_type: string
  target_id: string
  is_read: number
  created_at: string
}

/** LEFT JOIN 用户后的行（系统消息无触发者，相关字段为 null） */
interface NotificationWithActorRow extends NotificationRow {
  username: string | null
  nickname: string | null
  avatar: string | null
  level: number | null
  description: string | null
}

function rowToNotification(row: NotificationWithActorRow): NotificationItem {
  const actor: UserBrief | null =
    row.actor_id !== null && row.username !== null
      ? {
          id: row.actor_id,
          username: row.username,
          nickname: row.nickname ?? '',
          avatar: row.avatar ?? '',
          level: row.level ?? 1,
          description: row.description ?? '',
        }
      : null

  return {
    id: row.id,
    tab: row.tab as NotificationTab,
    actor,
    title: row.title,
    content: row.content,
    targetType: row.target_type as NotificationTargetType,
    targetId: row.target_id,
    read: row.is_read === 1,
    createdAt: row.created_at,
  }
}

/** 当前用户某分类下的消息：按时间倒序游标分页 */
export function listNotifications(
  userId: ID,
  params: { tab: NotificationTab; limit: number; cursor: string },
): CursorPage<NotificationItem> {
  const { tab, limit, cursor } = params
  const offset = Number.parseInt(cursor, 10) || 0

  const rows = db
    .prepare(
      `${NOTIFICATION_SELECT} WHERE n.user_id = ? AND n.tab = ? ORDER BY n.created_at DESC LIMIT ? OFFSET ?`,
    )
    .all(userId, tab, limit + 1, offset) as unknown as NotificationWithActorRow[]

  const hasMore = rows.length > limit
  const list = rows.slice(0, limit).map(rowToNotification)

  return { list, cursor: hasMore ? String(offset + limit) : '', hasMore }
}

/** 当前用户的未读消息统计（总数 + 各分类） */
export function countUnreadByTab(userId: ID): NotificationUnread {
  const rows = db
    .prepare(
      'SELECT tab, COUNT(*) AS c FROM notifications WHERE user_id = ? AND is_read = 0 GROUP BY tab',
    )
    .all(userId) as unknown as { tab: string; c: number }[]

  const unread = emptyNotificationUnread()
  for (const row of rows) {
    if (isNotificationTab(row.tab)) {
      unread.byTab[row.tab] = row.c
      unread.total += row.c
    }
  }
  return unread
}

/** 标记已读：传入 tab 只标记该分类，否则标记全部 */
export function markNotificationsRead(userId: ID, tab?: NotificationTab): void {
  if (tab) {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND tab = ?').run(userId, tab)
  } else {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(userId)
  }
}
