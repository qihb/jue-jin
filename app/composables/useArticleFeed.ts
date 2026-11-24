import type { Ref } from 'vue'
import type { ArticleSummary, CursorPage } from '~~/shared/types'
import { DEFAULT_PAGE_SIZE } from '~~/shared/constants'

/**
 * 首页文章流：首屏用 `useAsyncData` 取第一页（SSR 直出），
 * 客户端按游标追加下一页（无限滚动 / 手动「加载更多」）。
 * 切换分类时 `key` 变化自动重取第一页，并清空已追加的数据。
 */
export async function useArticleFeed(category: Ref<string>) {
  const { data, status, refresh } = await useAsyncData(
    () => `article-feed:${category.value}`,
    () =>
      request<CursorPage<ArticleSummary>>('/api/article/feed', {
        query: { category: category.value, limit: DEFAULT_PAGE_SIZE },
      }),
  )

  /** 首屏之后追加加载的文章 */
  const extra = ref<ArticleSummary[]>([])
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

  const articles = computed<ArticleSummary[]>(() => [...(data.value?.list ?? []), ...extra.value])

  async function loadMore() {
    if (loadingMore.value || !hasMore.value) return
    loadingMore.value = true
    try {
      const page = await request<CursorPage<ArticleSummary>>('/api/article/feed', {
        query: { category: category.value, limit: DEFAULT_PAGE_SIZE, cursor: cursor.value },
      })
      extra.value = [...extra.value, ...page.list]
      cursor.value = page.cursor
      hasMore.value = page.hasMore
    } finally {
      loadingMore.value = false
    }
  }

  return { articles, status, hasMore, loadingMore, loadMore, refresh }
}
