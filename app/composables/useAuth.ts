import type { UserBrief } from '~~/shared/types'

/**
 * 登录态入口：状态读 store，请求写在 composable（组件不直连接口）。
 * - 登录：POST /api/auth/login，服务端签发 JWT 并写入 HttpOnly Cookie
 * - 登出：POST /api/auth/logout，服务端清除 Cookie
 * - 会话恢复：由 app/plugins/auth.ts 在初始化时拉取 /api/user/current
 */
export function useAuth() {
  const store = useUserStore()
  const { user, isLoggedIn } = storeToRefs(store)

  async function loginWithDemo() {
    const brief = await request<UserBrief>('/api/auth/login', { method: 'POST' })
    store.login(brief)
  }

  async function logout() {
    await request('/api/auth/logout', { method: 'POST' })
    store.logout()
  }

  return { user, isLoggedIn, loginWithDemo, logout }
}
