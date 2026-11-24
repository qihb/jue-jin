import type { Ref } from 'vue'
import type { ArticleDetail, ArticleSummary, Comment, CursorPage, UserBrief } from '~~/shared/types'
import { DEFAULT_PAGE_SIZE } from '~~/shared/constants'

interface LikeResult {
  liked: boolean
  likeCount: number
}

interface CollectResult {
  collected: boolean
  collectCount: number
}

/**
 * 文章详情：首屏（正文 / 评论 / 相关推荐）SSR 直出，交互态（点赞 / 收藏 / 评论）本地维护。
 * 所有请求都在本 composable 内完成，组件不直连接口；未登录操作由 `loginRequired` 统一拦截。
 */
export async function useArticleDetail(id: Ref<string>) {
  const auth = useAuth()

  // 多处 useAsyncData 必须在同一同步阶段发起，避免 await 之后丢失 Nuxt 实例
  const [articleRes, commentRes, recommendRes] = await Promise.all([
    useAsyncData(`article-detail:${id.value}`, () =>
      request<ArticleDetail>(`/api/article/${id.value}`),
    ),
    useAsyncData(`article-comments:${id.value}`, () =>
      request<CursorPage<Comment>>('/api/comment/list', {
        query: { targetType: 'article', targetId: id.value, limit: DEFAULT_PAGE_SIZE },
      }),
    ),
    useAsyncData(`article-recommend:${id.value}`, () =>
      request<ArticleSummary[]>('/api/article/recommend', { query: { id: id.value } }),
    ),
  ])

  const article = articleRes.data
  const commentData = commentRes.data
  const recommend = computed<ArticleSummary[]>(() => recommendRes.data.value ?? [])

  /* ---------- 正文与目录 ---------- */
  const rendered = computed(() => renderMarkdown(article.value?.content ?? ''))
  const html = computed(() => rendered.value.html)
  const toc = computed(() => rendered.value.toc)
  const author = computed<UserBrief | null>(() => article.value?.author ?? null)

  /* ---------- 点赞 / 收藏 / 评论计数 ---------- */
  const liked = ref(false)
  const collected = ref(false)
  const likeCount = ref(0)
  const collectCount = ref(0)
  const commentCount = ref(0)

  watch(
    article,
    (value) => {
      liked.value = value?.liked ?? false
      collected.value = value?.collected ?? false
      likeCount.value = value?.likeCount ?? 0
      collectCount.value = value?.collectCount ?? 0
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

  /* ---------- 点赞 / 收藏 ---------- */
  async function toggleLike() {
    if (!ensureLoggedIn()) return
    const result = await request<LikeResult>('/api/article/like', {
      method: 'POST',
      body: { id: id.value },
    })
    liked.value = result.liked
    likeCount.value = result.likeCount
  }

  async function toggleCollect() {
    if (!ensureLoggedIn()) return
    const result = await request<CollectResult>('/api/article/collect', {
      method: 'POST',
      body: { id: id.value },
    })
    collected.value = result.collected
    collectCount.value = result.collectCount
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
      body: { targetType: 'article', targetId: id.value, content },
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
          targetType: 'article',
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
    article,
    status: articleRes.status,
    html,
    toc,
    author,
    recommend,
    liked,
    collected,
    likeCount,
    collectCount,
    commentCount,
    toggleLike,
    toggleCollect,
    comments,
    loadingComments,
    commentsHasMore,
    submitComment,
    loadMoreComments,
    loginRequired,
    ensureLoggedIn,
  }
}
