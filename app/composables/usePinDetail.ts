import type { Ref } from 'vue'
import type { Comment, CursorPage, PinDetail, PinLikeResult } from '~~/shared/types'
import { DEFAULT_PAGE_SIZE } from '~~/shared/constants'

/**
 * 沸点详情：正文与评论首屏 SSR 直出，点赞 / 评论交互态本地维护。
 * 所有请求都在本 composable 内完成，组件不直连接口；未登录操作由 `loginRequired` 统一拦截。
 */
export async function usePinDetail(id: Ref<string>) {
  const auth = useAuth()

  // 多处 useAsyncData 必须在同一同步阶段发起，避免 await 之后丢失 Nuxt 实例
  const [pinRes, commentRes] = await Promise.all([
    useAsyncData(`pin-detail:${id.value}`, () => request<PinDetail>(`/api/pin/${id.value}`)),
    useAsyncData(`pin-comments:${id.value}`, () =>
      request<CursorPage<Comment>>('/api/comment/list', {
        query: { targetType: 'pin', targetId: id.value, limit: DEFAULT_PAGE_SIZE },
      }),
    ),
  ])

  const pin = pinRes.data
  const commentData = commentRes.data

  /* ---------- 点赞 / 评论计数 ---------- */
  const liked = ref(false)
  const likeCount = ref(0)
  const commentCount = ref(0)

  watch(
    pin,
    (value) => {
      liked.value = value?.liked ?? false
      likeCount.value = value?.likeCount ?? 0
      commentCount.value = value?.commentCount ?? 0
    },
    { immediate: true },
  )

  /* ---------- 登录拦截 ---------- */
  const loginRequired = ref(false)

  function ensureLoggedIn(): boolean {
    if (auth.isLoggedIn.value) return true
    loginRequired.value = true
    return false
  }

  /* ---------- 点赞 ---------- */
  async function toggleLike() {
    if (!ensureLoggedIn()) return
    const result = await request<PinLikeResult>('/api/pin/like', {
      method: 'POST',
      body: { id: id.value },
    })
    liked.value = result.liked
    likeCount.value = result.likeCount
  }

  /* ---------- 评论（首屏 + 游标追加 + 本地新增置顶） ---------- */
  const localComments = ref<Comment[]>([])
  const extraComments = ref<Comment[]>([])
  const commentCursor = ref('')
  const commentsHasMore = ref(false)
  const loadingComments = ref(false)

  watch(
    commentData,
    (page) => {
      extraComments.value = []
      commentCursor.value = page?.cursor ?? ''
      commentsHasMore.value = page?.hasMore ?? false
    },
    { immediate: true },
  )

  const comments = computed<Comment[]>(() => [
    ...localComments.value,
    ...(commentData.value?.list ?? []),
    ...extraComments.value,
  ])

  async function submitComment(content: string): Promise<boolean> {
    if (!ensureLoggedIn()) return false
    const comment = await request<Comment>('/api/comment/publish', {
      method: 'POST',
      body: { targetType: 'pin', targetId: id.value, content },
    })
    localComments.value = [comment, ...localComments.value]
    commentCount.value += 1
    return true
  }

  async function loadMoreComments() {
    if (loadingComments.value || !commentsHasMore.value) return
    loadingComments.value = true
    try {
      const page = await request<CursorPage<Comment>>('/api/comment/list', {
        query: {
          targetType: 'pin',
          targetId: id.value,
          limit: DEFAULT_PAGE_SIZE,
          cursor: commentCursor.value,
        },
      })
      extraComments.value = [...extraComments.value, ...page.list]
      commentCursor.value = page.cursor
      commentsHasMore.value = page.hasMore
    } finally {
      loadingComments.value = false
    }
  }

  return {
    pin,
    status: pinRes.status,
    liked,
    likeCount,
    commentCount,
    toggleLike,
    comments,
    loadingComments,
    commentsHasMore,
    submitComment,
    loadMoreComments,
    loginRequired,
  }
}
