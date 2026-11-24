import { DEFAULT_SORT } from '~~/shared/constants'

/**
 * 首页内容流：分类（category）+ 排序方式（sort），均与 URL query 双向同步。
 * - category：分类筛选，空串表示「综合」
 * - sort：排序方式（recommend / newest / follow），默认 recommend
 */
export function useFeedCategory() {
  const route = useRoute()
  const router = useRouter()

  const category = computed(() => {
    const value = route.query.category
    return typeof value === 'string' ? value : ''
  })

  const sort = computed(() => {
    const value = route.query.sort
    return typeof value === 'string' && value ? value : DEFAULT_SORT
  })

  function setCategory(value: string) {
    void router.replace({
      query: {
        ...route.query,
        category: value || undefined,
      },
    })
  }

  function setSort(value: string) {
    void router.replace({
      query: {
        ...route.query,
        sort: value === DEFAULT_SORT ? undefined : value,
      },
    })
  }

  return { category, sort, setCategory, setSort }
}
