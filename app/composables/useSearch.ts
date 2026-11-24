import type { CursorPage, SearchItem, SearchType } from '~~/shared/types'
import { DEFAULT_PAGE_SIZE, DEFAULT_SEARCH_TYPE, isSearchType } from '~~/shared/constants'

/**
 * 全局搜索：关键字 / 分类与 URL query 双向同步（刷新、分享、前进后退均可保持），
 * 首屏用 `useAsyncData` 取第一页（SSR 直出），客户端按游标追加。
 */
export async function useSearch() {
  const route = useRoute()
  const router = useRouter()

  const keyword = computed(() => (typeof route.query.q === 'string' ? route.query.q.trim() : ''))
  const type = computed<SearchType>(() => {
    const value = route.query.type
    return isSearchType(value) ? value : DEFAULT_SEARCH_TYPE
  })

  const { data, status } = await useAsyncData(
    () => `search:${type.value}:${keyword.value}`,
    () =>
      request<CursorPage<SearchItem>>('/api/search', {
        query: { q: keyword.value, type: type.value, limit: DEFAULT_PAGE_SIZE },
      }),
  )

  /** 首屏之后追加加载的结果 */
  const extra = ref<SearchItem[]>([])
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

  const results = computed<SearchItem[]>(() => [...(data.value?.list ?? []), ...extra.value])

  async function loadMore() {
    if (loadingMore.value || !hasMore.value) return
    loadingMore.value = true
    try {
      const page = await request<CursorPage<SearchItem>>('/api/search', {
        query: {
          q: keyword.value,
          type: type.value,
          limit: DEFAULT_PAGE_SIZE,
          cursor: cursor.value,
        },
      })
      extra.value = [...extra.value, ...page.list]
      cursor.value = page.cursor
      hasMore.value = page.hasMore
    } finally {
      loadingMore.value = false
    }
  }

  /** 切换搜索结果分类：写回 URL query，触发重新取数 */
  function setType(value: string) {
    if (!isSearchType(value)) return
    void router.push({ query: { ...route.query, type: value } })
  }

  return { keyword, type, results, status, hasMore, loadingMore, loadMore, setType }
}
