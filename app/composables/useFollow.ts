import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import type { FollowState, ID } from '~~/shared/types'

interface UseFollowOptions {
  /** 初始关注态（可传响应式来源，如详情数据里的 `following`） */
  initial?: MaybeRefOrGetter<boolean>
}

/**
 * 关注态：本地维护关注 / 取关，未登录时置 `loginRequired`（由调用方弹登录门）。
 * 供文章 / 沸点作者位、搜索结果、用户主页等多处复用。
 */
export function useFollow(targetId: MaybeRefOrGetter<ID>, options: UseFollowOptions = {}) {
  const auth = useAuth()

  const following = ref(false)
  const loading = ref(false)
  const loginRequired = ref(false)

  if (options.initial !== undefined) {
    const initial = options.initial
    watch(
      () => toValue(initial),
      (value) => {
        following.value = value
      },
      { immediate: true },
    )
  }

  async function toggle() {
    if (!auth.isLoggedIn.value) {
      loginRequired.value = true
      return
    }
    if (loading.value) return
    loading.value = true
    try {
      const state = await request<FollowState>('/api/user/follow', {
        method: 'POST',
        body: { userId: toValue(targetId) },
      })
      following.value = state.following
    } finally {
      loading.value = false
    }
  }

  return { following, loading, loginRequired, toggle }
}
