import type { ArticleSummary, CreatorOverview, CursorPage } from '~~/shared/types'
import { DEFAULT_PAGE_SIZE } from '~~/shared/constants'

/** 创作者中心：数据概览 + 内容管理列表（首屏 SSR 直出，客户端游标追加） */
export async function useCreator() {
  const [overviewRes, contentRes] = await Promise.all([
    useAsyncData('creator-overview', () => request<CreatorOverview>('/api/creator/overview')),
    useAsyncData('creator-contents', () =>
      request<CursorPage<ArticleSummary>>('/api/creator/contents', {
        query: { limit: DEFAULT_PAGE_SIZE },
      }),
    ),
  ])

  const overview = overviewRes.data
  const firstPage = contentRes.data

  const extra = ref<ArticleSummary[]>([])
  const cursor = ref('')
  const hasMore = ref(false)
  const loadingMore = ref(false)

  watch(
    firstPage,
    (page) => {
      extra.value = []
      cursor.value = page?.cursor ?? ''
      hasMore.value = page?.hasMore ?? false
    },
    { immediate: true },
  )

  const articles = computed<ArticleSummary[]>(() => [...(firstPage.value?.list ?? []), ...extra.value])

  async function loadMore() {
    if (loadingMore.value || !hasMore.value) return
    loadingMore.value = true
    try {
      const page = await request<CursorPage<ArticleSummary>>('/api/creator/contents', {
        query: { limit: DEFAULT_PAGE_SIZE, cursor: cursor.value },
      })
      extra.value = [...extra.value, ...page.list]
      cursor.value = page.cursor
      hasMore.value = page.hasMore
    } finally {
      loadingMore.value = false
    }
  }

  return {
    overview,
    status: overviewRes.status,
    articles,
    hasMore,
    loadingMore,
    loadMore,
  }
}
