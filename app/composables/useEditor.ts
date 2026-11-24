import type { ArticleFormValue, ArticleSummary } from '~~/shared/types'
import { CONTENT_CATEGORIES } from '~~/shared/constants'

/** 标题最大长度 */
export const TITLE_MAX_LENGTH = 100

/** 自动保存草稿的防抖间隔（ms） */
const AUTO_SAVE_DELAY = 2000

/** 编辑器初始值：新建时传空，编辑草稿时传草稿内容 + draftId */
export interface EditorInitialValue extends Partial<ArticleFormValue> {
  draftId?: string
}

/**
 * 文章编辑器：表单状态聚合 + 草稿自动保存 + 发布。
 * 所有请求收敛在本 composable；未登录操作由 `loginRequired` 统一拦截（演示登录弹窗）。
 */
export function useEditor(initial: EditorInitialValue = {}) {
  const auth = useAuth()
  const { saveDraft, removeDraft } = useDraft()

  const title = ref(initial.title ?? '')
  const content = ref(initial.content ?? '')
  const brief = ref(initial.brief ?? '')
  const cover = ref(initial.cover ?? '')
  const categoryId = ref(initial.categoryId || (CONTENT_CATEGORIES[0]?.id ?? 'frontend'))
  const tags = ref<string[]>([...(initial.tags ?? [])])
  const draftId = ref(initial.draftId ?? '')

  const form = computed<ArticleFormValue>(() => ({
    title: title.value,
    content: content.value,
    brief: brief.value,
    cover: cover.value,
    categoryId: categoryId.value,
    tags: tags.value,
  }))

  /** 正文字数（不含空白字符） */
  const wordCount = computed(() => content.value.replace(/\s/g, '').length)
  const canPublish = computed(() => title.value.trim() !== '' && content.value.trim() !== '')

  /* ---------- 登录拦截（演示登录弹窗） ---------- */
  const loginRequired = ref(false)
  function ensureLoggedIn(): boolean {
    if (auth.isLoggedIn.value) return true
    loginRequired.value = true
    return false
  }

  /* ---------- 草稿自动保存 ---------- */
  const savedAt = ref('')
  const autoSaveEnabled = ref(true)

  function persist() {
    const value = form.value
    if (!value.title.trim() && !value.content.trim()) return
    draftId.value = saveDraft(value, draftId.value || undefined)
    savedAt.value = new Date().toISOString()
  }

  const debouncedPersist = useDebounceFn(persist, AUTO_SAVE_DELAY)

  // 仅在客户端监听：SSR 阶段不落盘，避免服务端写入
  if (import.meta.client) {
    watch(form, () => {
      if (autoSaveEnabled.value) debouncedPersist()
    })
  }

  /** 手动保存（「存草稿」按钮）：先取消待执行的自动保存，再立即落盘 */
  function saveNow() {
    debouncedPersist.cancel()
    persist()
  }

  /* ---------- 发布 ---------- */
  const publishing = ref(false)

  /** 发布文章：成功返回新文章 id（供页面跳转），未登录或被拦截时返回 null */
  async function publish(): Promise<string | null> {
    if (!ensureLoggedIn()) return null
    publishing.value = true
    try {
      const created = await request<ArticleSummary>('/api/article/publish', {
        method: 'POST',
        body: { ...form.value },
      })
      if (draftId.value) removeDraft(draftId.value)
      draftId.value = ''
      savedAt.value = ''
      debouncedPersist.cancel()
      return created.id
    } finally {
      publishing.value = false
    }
  }

  return {
    title,
    content,
    brief,
    cover,
    categoryId,
    tags,
    wordCount,
    canPublish,
    saving: autoSaveEnabled,
    savedAt,
    saveNow,
    publishing,
    publish,
    loginRequired,
    ensureLoggedIn,
  }
}
