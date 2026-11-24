import type { UserBrief } from '~~/shared/types'

/** 登录态持久化 cookie 名与有效期 */
const USER_COOKIE = 'jj-user'
const USER_COOKIE_MAX_AGE = 60 * 60 * 24 * 7

/** 当前登录用户：跨页面共享，cookie 持久化（阶段 5 接入真实登录后沿用） */
export const useUserStore = defineStore('user', () => {
  const cookie = useCookie<UserBrief | null>(USER_COOKIE, {
    default: () => null,
    maxAge: USER_COOKIE_MAX_AGE,
    sameSite: 'lax',
  })

  // 以 cookie 为准初始化，保证 SSR 与客户端一致
  const user = ref<UserBrief | null>(cookie.value)
  const isLoggedIn = computed(() => user.value !== null)

  function login(next: UserBrief) {
    user.value = next
    cookie.value = next
  }

  function logout() {
    user.value = null
    cookie.value = null
  }

  return { user, isLoggedIn, login, logout }
})
