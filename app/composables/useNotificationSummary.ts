import type { NotificationUnread } from '~~/shared/types'
import { emptyNotificationUnread } from '~~/shared/constants'

/**
 * 未读消息统计：供头部铃铛角标与消息中心 Tab 角标共用。
 * 未登录时接口返回全 0，因此无需额外登录判断。
 */
export async function useNotificationSummary() {
  const { data, refresh } = await useAsyncData('notification-unread', () =>
    request<NotificationUnread>('/api/notification/unread'),
  )

  const unread = computed<NotificationUnread>(() => data.value ?? emptyNotificationUnread())

  return { unread, refresh }
}
