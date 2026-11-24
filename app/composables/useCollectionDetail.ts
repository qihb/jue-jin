import type { Ref } from 'vue'
import type { ArticleSummary, CollectionDetail } from '~~/shared/types'
import { DEFAULT_PAGE_SIZE } from '~~/shared/constants'

/**
 * 收藏集详情：首屏 `useAsyncData` 取数（SSR 直出），切换 id 时自动重取；
 * 收集的文章按游标追加。
 */
export async function useCollectionDetail(id: Ref<string>) {
  const { data, status, refresh } = await useAsyncData(
    () => `collection-detail:${id.value}`,
    () =>
      request<CollectionDetail | null>(`/api/collection/${id.value}`, {
        query: { limit: DEFAULT_PAGE_SIZE },
      }),
  )

  const detail = computed(() => data.value ?? null)
  const collection = computed(() => data.value?.collection ?? null)

  /** 首屏之后追加加载的文章 */
  const extra = ref<ArticleSummary[]>([])
  const cursor = ref('')
  const hasMore = ref(false)
  const loadingMore = ref(false)

  watch(
    data,
    (value) => {
      extra.value = []
      cursor.value = value?.articles.cursor ?? ''
      hasMore.value = value?.articles.hasMore ?? false
    },
    { immediate: true },
  )

  const articles = computed<ArticleSummary[]>(() => [
    ...(data.value?.articles.list ?? []),
    ...extra.value,
  ])

  async function loadMore() {
    if (loadingMore.value || !hasMore.value) return
    loadingMore.value = true
    try {
      const page = await request<CollectionDetail | null>(`/api/collection/${id.value}`, {
        query: { limit: DEFAULT_PAGE_SIZE, cursor: cursor.value },
      })
      const next = page?.articles
      if (next) {
        extra.value = [...extra.value, ...next.list]
        cursor.value = next.cursor
        hasMore.value = next.hasMore
      } else {
        hasMore.value = false
      }
    } finally {
      loadingMore.value = false
    }
  }

  return { detail, collection, articles, status, hasMore, loadingMore, loadMore, refresh }
}
