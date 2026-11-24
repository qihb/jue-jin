import type { ApiResp, NotificationUnread } from '~~/shared/types'
import { isNotificationTab } from '~~/shared/constants'
import { countUnreadByTab, markNotificationsRead } from '~~/server/db'
import { fail, ok } from '~~/server/utils/resp'

/** 标记消息已读：body.tab 指定分类则只标记该分类，否则标记全部（需登录） */
export default defineEventHandler(async (event): Promise<ApiResp<NotificationUnread>> => {
  const user = event.context.user as { id: string } | null
  if (!user) {
    return fail<NotificationUnread>('请先登录', 401)
  }

  const body = await readBody<{ tab?: unknown } | undefined>(event)
  const tab = isNotificationTab(body?.tab) ? body.tab : undefined
  markNotificationsRead(user.id, tab)
  return ok(countUnreadByTab(user.id))
})
