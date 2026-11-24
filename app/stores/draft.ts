import type { ArticleDraft, ArticleFormValue } from '~~/shared/types'

/** 草稿本地存储 key（仅浏览器，不入服务端） */
const DRAFTS_STORAGE_KEY = 'jj-drafts'

/** 生成本地草稿 id：时间戳 + 随机后缀，避免快速连续保存冲突 */
function createDraftId(): string {
  return `draft_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
}

/** 编辑器草稿：本地持久化，跨页面共享（编辑器 ↔ 草稿箱 ↔ 创作者中心） */
export const useDraftStore = defineStore('draft', () => {
  const drafts = useLocalStorage<ArticleDraft[]>(DRAFTS_STORAGE_KEY, [])

  /** 按最后保存时间倒序，草稿箱与创作中心均以此为准 */
  const sortedDrafts = computed(() =>
    [...drafts.value].toSorted((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
  )

  function getById(id: string): ArticleDraft | undefined {
    return drafts.value.find((item) => item.id === id)
  }

  /** 保存草稿：传 id 则更新，否则新建；返回草稿 id */
  function save(value: ArticleFormValue, id?: string): string {
    const targetId = id || createDraftId()
    const next: ArticleDraft = { ...value, id: targetId, updatedAt: new Date().toISOString() }
    const index = drafts.value.findIndex((item) => item.id === targetId)
    if (index >= 0) drafts.value[index] = next
    else drafts.value = [next, ...drafts.value]
    return targetId
  }

  function remove(id: string) {
    drafts.value = drafts.value.filter((item) => item.id !== id)
  }

  return { drafts, sortedDrafts, getById, save, remove }
})
