import type { ArticleDraft, ArticleFormValue } from '~~/shared/types'

/**
 * 草稿：本地持久化读写（编辑器 / 草稿箱 / 创作者中心共用）。
 * 组件不直连 store，统一走本 composable；`mounted` 供页面在客户端就绪后再渲染草稿列表，
 * 避免 SSR 空列表与客户端已有数据造成水合不一致。
 */
export function useDraft() {
  const store = useDraftStore()
  const { sortedDrafts } = storeToRefs(store)

  const mounted = ref(false)
  onMounted(() => {
    mounted.value = true
  })

  function saveDraft(value: ArticleFormValue, id?: string): string {
    return store.save(value, id)
  }

  function removeDraft(id: string) {
    store.remove(id)
  }

  function getDraft(id: string): ArticleDraft | undefined {
    return store.getById(id)
  }

  return { drafts: sortedDrafts, mounted, saveDraft, removeDraft, getDraft }
}
