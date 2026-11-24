import type { ApiResp, NotificationUnread } from '~~/shared/types'
import { emptyNotificationUnread } from '~~/shared/constants'
import { countUnreadByTab } from '~~/server/db'
import { ok } from '~~/server/utils/resp'

/** 未读消息统计：未登录返回全 0（前端角标据此隐藏） */
export default defineEventHandler((event): ApiResp<NotificationUnread> => {
  const user = event.context.user as { id: string } | null
  if (!user) {
    return ok(emptyNotificationUnread())
  }
  return ok(countUnreadByTab(user.id))
})
