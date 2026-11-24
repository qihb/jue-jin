import type { BookSummary, CursorPage } from '~~/shared/types'
import { DEFAULT_PAGE_SIZE } from '~~/shared/constants'

/**
 * 小册列表：首屏用 `useAsyncData` 取第一页（SSR 直出），
 * 客户端按游标追加下一页（无限滚动 / 手动「加载更多」）。
 */
export async function useBookList() {
  const { data, status } = await useAsyncData('book-list', () =>
    request<CursorPage<BookSummary>>('/api/book/list', { query: { limit: DEFAULT_PAGE_SIZE } }),
  )

  /** 首屏之后追加加载的小册 */
  const extra = ref<BookSummary[]>([])
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

  const books = computed<BookSummary[]>(() => [...(data.value?.list ?? []), ...extra.value])

  async function loadMore() {
    if (loadingMore.value || !hasMore.value) return
    loadingMore.value = true
    try {
      const page = await request<CursorPage<BookSummary>>('/api/book/list', {
        query: { limit: DEFAULT_PAGE_SIZE, cursor: cursor.value },
      })
      extra.value = [...extra.value, ...page.list]
      cursor.value = page.cursor
      hasMore.value = page.hasMore
    } finally {
      loadingMore.value = false
    }
  }

  return { books, status, hasMore, loadingMore, loadMore }
}
