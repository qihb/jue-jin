import type { CursorPage, PinDetail } from '~~/shared/types'
import { DEFAULT_PAGE_SIZE } from '~~/shared/constants'

/**
 * 沸点流：首屏用 `useAsyncData` 取第一页（SSR 直出），
 * 客户端按游标追加下一页（无限滚动 / 手动「加载更多」）。
 */
export async function usePinFeed() {
  const { data, status } = await useAsyncData('pin-feed', () =>
    request<CursorPage<PinDetail>>('/api/pin/list', { query: { limit: DEFAULT_PAGE_SIZE } }),
  )

  /** 首屏之后追加加载的沸点 */
  const extra = ref<PinDetail[]>([])
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

  const pins = computed<PinDetail[]>(() => [...(data.value?.list ?? []), ...extra.value])

  async function loadMore() {
    if (loadingMore.value || !hasMore.value) return
    loadingMore.value = true
    try {
      const page = await request<CursorPage<PinDetail>>('/api/pin/list', {
        query: { limit: DEFAULT_PAGE_SIZE, cursor: cursor.value },
      })
      extra.value = [...extra.value, ...page.list]
      cursor.value = page.cursor
      hasMore.value = page.hasMore
    } finally {
      loadingMore.value = false
    }
  }

  return { pins, status, hasMore, loadingMore, loadMore }
}
