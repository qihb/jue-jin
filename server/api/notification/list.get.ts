import type { ApiResp, CursorPage, NotificationItem } from '~~/shared/types'
import { DEFAULT_NOTIFICATION_TAB, isNotificationTab } from '~~/shared/constants'
import { listNotifications } from '~~/server/db'
import { normalizeCursorQuery, ok } from '~~/server/utils/resp'

/** 消息列表：按分类游标分页（未登录返回空列表） */
export default defineEventHandler((event): ApiResp<CursorPage<NotificationItem>> => {
  const user = event.context.user as { id: string } | null
  if (!user) {
    return ok({ list: [], cursor: '', hasMore: false })
  }

  const query = getQuery(event)
  const tab = isNotificationTab(query.tab) ? query.tab : DEFAULT_NOTIFICATION_TAB
  return ok(listNotifications(user.id, { tab, ...normalizeCursorQuery(query) }))
})
