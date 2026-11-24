import type { User } from '~~/shared/types'

/**
 * 当前登录用户：跨页面共享的内存状态。
 * 真实登录态由服务端 JWT Cookie（HttpOnly）维护，本 store 仅缓存用户信息；
 * 会话恢复由 app/plugins/auth.ts 在应用初始化时拉取 /api/user/current 完成。
 * 存储完整 User（含职位/公司/统计数），供右侧栏等场景展示。
 */
export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const isLoggedIn = computed(() => user.value !== null)

  function login(next: User) {
    user.value = next
  }

  function logout() {
    user.value = null
  }

  return { user, isLoggedIn, login, logout }
})
