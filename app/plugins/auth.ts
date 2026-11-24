import type { UserBrief } from '~~/shared/types'

/**
 * 应用初始化：根据 JWT Cookie 恢复登录态。
 *
 * - SSR 阶段：请求携带 Cookie，Nitro 中间件解析后 /api/user/current 返回当前用户
 * - 客户端 hydration：复用 useAsyncData 序列化结果，不重复发起请求
 * - 未登录（401）时静默置空，由前端登录门唤起登录弹窗
 */
export default defineNuxtPlugin(async () => {
  const userStore = useUserStore()
  if (userStore.user) return

  const { data } = await useAsyncData<UserBrief | null>('auth:current-user', async () => {
    try {
      return await request<UserBrief>('/api/user/current')
    } catch {
      return null
    }
  })

  if (data.value) {
    userStore.login(data.value)
  }
})
