import type { CursorPage, NotificationItem, NotificationTab, NotificationUnread } from '~~/shared/types'
import {
  DEFAULT_NOTIFICATION_TAB,
  DEFAULT_PAGE_SIZE,
  isNotificationTab,
} from '~~/shared/constants'

/**
 * 消息中心：分类 Tab 与 URL query 双向同步，首屏用 `useAsyncData` 取第一页（SSR 直出），
 * 客户端按游标追加下一页。
 */
export async function useNotification() {
  const route = useRoute()
  const router = useRouter()

  const tab = computed<NotificationTab>(() => {
    const value = route.query.tab
    return isNotificationTab(value) ? value : DEFAULT_NOTIFICATION_TAB
  })

  /** 切换分类：默认分类不写 query，保持地址干净 */
  function setTab(value: string) {
    if (!isNotificationTab(value) || value === tab.value) return
    void router.replace({ query: value === DEFAULT_NOTIFICATION_TAB ? {} : { tab: value } })
  }

  const { data, status, refresh } = await useAsyncData(
    () => `notification:${tab.value}`,
    () =>
      request<CursorPage<NotificationItem>>('/api/notification/list', {
        query: { tab: tab.value, limit: DEFAULT_PAGE_SIZE },
      }),
  )

  /** 首屏之后追加加载的消息 */
  const extra = ref<NotificationItem[]>([])
  const cursor = ref('')
  const hasMore = ref(false)
  const loadingMore = ref(false)

  watch(
    data,
    (page) => {
      extra.value = []
      cursor.value = page?.cursor ?? ''
      hasMore.value = page?.hasMore ?? false
    },
    { immediate: true },
  )

  const items = computed<NotificationItem[]>(() => [...(data.value?.list ?? []), ...extra.value])

  async function loadMore() {
    if (loadingMore.value || !hasMore.value) return
    loadingMore.value = true
    try {
      const page = await request<CursorPage<NotificationItem>>('/api/notification/list', {
        query: { tab: tab.value, limit: DEFAULT_PAGE_SIZE, cursor: cursor.value },
      })
      extra.value = [...extra.value, ...page.list]
      cursor.value = page.cursor
      hasMore.value = page.hasMore
    } finally {
      loadingMore.value = false
    }
  }

  /** 标记已读（不传分类则全部标记），随后刷新列表 */
  async function markRead(target?: NotificationTab) {
    await request<NotificationUnread>('/api/notification/read', {
      method: 'POST',
      body: target ? { tab: target } : {},
    })
    await refresh()
  }

  return { tab, setTab, items, status, hasMore, loadingMore, loadMore, refresh, markRead }
}
