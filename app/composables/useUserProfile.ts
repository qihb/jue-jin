import type { Ref } from 'vue'
import type {
  ArticleSummary,
  CollectionSummary,
  CursorPage,
  FollowState,
  PinDetail,
  UserBrief,
  UserProfile,
  UserProfileTab,
} from '~~/shared/types'
import { DEFAULT_PAGE_SIZE, DEFAULT_USER_PROFILE_TAB, isUserProfileTab } from '~~/shared/constants'

/** 各 Tab 首屏页数据（判别联合，便于按 tab 收窄后取值） */
type UserTabPage =
  | { tab: 'articles'; list: ArticleSummary[]; cursor: string; hasMore: boolean }
  | { tab: 'likes'; list: ArticleSummary[]; cursor: string; hasMore: boolean }
  | { tab: 'pins'; list: PinDetail[]; cursor: string; hasMore: boolean }
  | { tab: 'collections'; list: CollectionSummary[]; cursor: string; hasMore: boolean }
  | { tab: 'following'; list: UserBrief[]; cursor: string; hasMore: boolean }

/** 追加页元素类型（与 UserTabPage 各分支的 list 元素一致） */
type UserTabItem = ArticleSummary | PinDetail | CollectionSummary | UserBrief

/**
 * 用户主页：资料首屏 + 当前 Tab 第一页 SSR 直出，
 * Tab 与 URL query 双向同步，切换时按游标重取；各 Tab 支持追加分页；关注态本地维护。
 * 所有请求都在此完成，页面 / 组件不直连接口。
 */
export async function useUserProfile(id: Ref<string>) {
  const route = useRoute()
  const router = useRouter()
  const auth = useAuth()

  /* ---------- Tab 与 URL query 双向同步 ---------- */
  const activeTab = computed<UserProfileTab>(() => {
    const value = route.query.tab
    return isUserProfileTab(value) ? value : DEFAULT_USER_PROFILE_TAB
  })

  function setTab(value: string) {
    if (!isUserProfileTab(value)) return
    void router.replace({ query: value === DEFAULT_USER_PROFILE_TAB ? {} : { tab: value } })
  }

  /** 按 Tab 取一页（首屏与追加共用） */
  async function fetchTabPage(tab: UserProfileTab, cursor: string): Promise<UserTabPage> {
    const query = { limit: DEFAULT_PAGE_SIZE, cursor }
    const base = `/api/user/${id.value}`

    if (tab === 'pins') {
      const page = await request<CursorPage<PinDetail>>(`${base}/pins`, { query })
      return { tab: 'pins', list: page.list, cursor: page.cursor, hasMore: page.hasMore }
    }
    if (tab === 'collections') {
      const page = await request<CursorPage<CollectionSummary>>(`${base}/collections`, { query })
      return { tab: 'collections', list: page.list, cursor: page.cursor, hasMore: page.hasMore }
    }
    if (tab === 'following') {
      const page = await request<CursorPage<UserBrief>>(`${base}/following`, { query })
      return { tab: 'following', list: page.list, cursor: page.cursor, hasMore: page.hasMore }
    }
    if (tab === 'likes') {
      const page = await request<CursorPage<ArticleSummary>>(`${base}/likes`, { query })
      return { tab: 'likes', list: page.list, cursor: page.cursor, hasMore: page.hasMore }
    }
    const page = await request<CursorPage<ArticleSummary>>(`${base}/articles`, { query })
    return { tab: 'articles', list: page.list, cursor: page.cursor, hasMore: page.hasMore }
  }

  /* ---------- 首屏：资料 + 当前 Tab 第一页（SSR 直出） ---------- */
  const [profileRes, tabRes] = await Promise.all([
    useAsyncData(`user-profile:${id.value}`, () => request<UserProfile>(`/api/user/${id.value}`)),
    useAsyncData(() => `user-profile-tab:${id.value}:${activeTab.value}`, () =>
      fetchTabPage(activeTab.value, ''),
    ),
  ])

  const profile = profileRes.data
  const profileStatus = profileRes.status
  const firstPage = tabRes.data
  const listStatus = tabRes.status

  /* ---------- 关注态（初始取资料里的 following） ---------- */
  const following = ref(false)
  const followerCount = ref(0)

  watch(
    profile,
    (value) => {
      following.value = value?.following ?? false
      followerCount.value = value?.followerCount ?? 0
    },
    { immediate: true },
  )

  /* ---------- 追加分页 ---------- */
  const extra = ref<UserTabItem[]>([])
  const cursor = ref('')
  const hasMore = ref(false)
  const loadingMore = ref(false)

  watch(
    firstPage,
    (page) => {
      extra.value = []
      cursor.value = page?.cursor ?? ''
      hasMore.value = page?.hasMore ?? false
    },
    { immediate: true },
  )

  const articles = computed<ArticleSummary[]>(() => {
    const page = firstPage.value
    if (page?.tab !== 'articles') return []
    return [...page.list, ...(extra.value as ArticleSummary[])]
  })

  const likes = computed<ArticleSummary[]>(() => {
    const page = firstPage.value
    if (page?.tab !== 'likes') return []
    return [...page.list, ...(extra.value as ArticleSummary[])]
  })

  const pins = computed<PinDetail[]>(() => {
    const page = firstPage.value
    if (page?.tab !== 'pins') return []
    return [...page.list, ...(extra.value as PinDetail[])]
  })

  const collections = computed<CollectionSummary[]>(() => {
    const page = firstPage.value
    if (page?.tab !== 'collections') return []
    return [...page.list, ...(extra.value as CollectionSummary[])]
  })

  const followingList = computed<UserBrief[]>(() => {
    const page = firstPage.value
    if (page?.tab !== 'following') return []
    return [...page.list, ...(extra.value as UserBrief[])]
  })

  async function loadMore() {
    if (loadingMore.value || !hasMore.value) return
    loadingMore.value = true
    try {
      const page = await fetchTabPage(activeTab.value, cursor.value)
      extra.value = [...extra.value, ...page.list]
      cursor.value = page.cursor
      hasMore.value = page.hasMore
    } finally {
      loadingMore.value = false
    }
  }

  /* ---------- 关注切换（未登录弹登录门） ---------- */
  const loginRequired = ref(false)
  const followLoading = ref(false)

  async function toggleFollow() {
    if (!auth.isLoggedIn.value) {
      loginRequired.value = true
      return
    }
    if (followLoading.value) return
    followLoading.value = true
    try {
      const state = await request<FollowState>('/api/user/follow', {
        method: 'POST',
        body: { userId: id.value },
      })
      following.value = state.following
      followerCount.value = state.followerCount
    } finally {
      followLoading.value = false
    }
  }

  return {
    profile,
    profileStatus,
    activeTab,
    setTab,
    articles,
    likes,
    pins,
    collections,
    followingList,
    listStatus,
    hasMore,
    loadingMore,
    loadMore,
    following,
    followerCount,
    followLoading,
    toggleFollow,
    loginRequired,
  }
}
