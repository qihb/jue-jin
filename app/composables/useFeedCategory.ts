import { DEFAULT_CATEGORY_ID } from '~~/shared/constants'

/** 首页内容流分类：与 URL query `category` 双向同步，刷新/分享可保持当前分类 */
export function useFeedCategory() {
  const route = useRoute()
  const router = useRouter()

  const category = computed(() => {
    const value = route.query.category
    return typeof value === 'string' && value ? value : DEFAULT_CATEGORY_ID
  })

  function setCategory(value: string) {
    void router.replace({ query: value === DEFAULT_CATEGORY_ID ? {} : { category: value } })
  }

  return { category, setCategory }
}
