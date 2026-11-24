import type { UserBrief } from '~~/shared/types'

/**
 * 登录态入口：状态读 store，请求写在 composable（组件不直连接口）。
 * 阶段 4 的登录为占位实现（取 mock 当前用户），阶段 5 替换为账号密码登录。
 */
export function useAuth() {
  const store = useUserStore()
  const { user, isLoggedIn } = storeToRefs(store)

  async function loginWithDemo() {
    const demo = await request<UserBrief>('/api/user/current')
    store.login(demo)
  }

  function logout() {
    store.logout()
  }

  return { user, isLoggedIn, loginWithDemo, logout }
}
