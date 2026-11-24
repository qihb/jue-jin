import type { Ref } from 'vue'
import type { ArticleSummary, TagDetail } from '~~/shared/types'
import { DEFAULT_PAGE_SIZE } from '~~/shared/constants'

/**
 * 标签页：首屏用 `useAsyncData` 取标签信息与第一页文章（SSR 直出），
 * 客户端按游标追加后续文章；切换标签时 `key` 变化自动重取。
 */
export async function useTagDetail(tagName: Ref<string>) {
  const url = computed(() => `/api/tag/${encodeURIComponent(tagName.value)}`)

  const { data, status } = await useAsyncData(
    () => `tag-detail:${tagName.value}`,
    () =>
      request<TagDetail>(url.value, {
        query: { limit: DEFAULT_PAGE_SIZE },
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
      cursor.value = page?.articles.cursor ?? ''
      hasMore.value = page?.articles.hasMore ?? false
    },
    { immediate: true },
  )

  const tag = computed(() => data.value?.tag ?? null)
  const articles = computed<ArticleSummary[]>(() => [
    ...(data.value?.articles.list ?? []),
    ...extra.value,
  ])

  async function loadMore() {
    if (loadingMore.value || !hasMore.value) return
    loadingMore.value = true
    try {
      const page = await request<TagDetail>(url.value, {
        query: { limit: DEFAULT_PAGE_SIZE, cursor: cursor.value },
      })
      extra.value = [...extra.value, ...page.articles.list]
      cursor.value = page.articles.cursor
      hasMore.value = page.articles.hasMore
    } finally {
      loadingMore.value = false
    }
  }

  return { tag, articles, status, hasMore, loadingMore, loadMore }
}
