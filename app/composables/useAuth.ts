import type { UserBrief } from '~~/shared/types'

/** 修改密码（需登录）：不依赖登录态 store，提升到模块作用域避免重复创建 */
async function changePassword(oldPassword: string, newPassword: string) {
  await request('/api/auth/password', { method: 'POST', body: { oldPassword, newPassword } })
}

/**
 * 登录态入口：状态读 store，请求写在 composable（组件不直连接口）。
 * - 注册 / 登录：POST /api/auth/{register,login}，服务端签发 JWT 并写入 HttpOnly Cookie
 * - 登出：POST /api/auth/logout，服务端清除 Cookie
 * - 会话恢复：由 app/plugins/auth.ts 在初始化时拉取 /api/user/current
 */
export function useAuth() {
  const store = useUserStore()
  const { user, isLoggedIn } = storeToRefs(store)

  /** 一键演示登录（无 body 时服务端走演示账号） */
  async function loginWithDemo() {
    const brief = await request<UserBrief>('/api/auth/login', { method: 'POST' })
    store.login(brief)
  }

  /** 账号密码登录 */
  async function loginWithPassword(username: string, password: string) {
    const brief = await request<UserBrief>('/api/auth/login', {
      method: 'POST',
      body: { username, password },
    })
    store.login(brief)
  }

  /** 注册并自动登录 */
  async function register(params: { username: string; nickname: string; password: string }) {
    const brief = await request<UserBrief>('/api/auth/register', {
      method: 'POST',
      body: params,
    })
    store.login(brief)
  }

  async function logout() {
    await request('/api/auth/logout', { method: 'POST' })
    store.logout()
  }

  return { user, isLoggedIn, loginWithDemo, loginWithPassword, register, changePassword, logout }
}
