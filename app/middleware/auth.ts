/**
 * 需登录路由守卫：未登录时跳转登录页并带上 redirect。
 * 阶段 4 仅提供守卫实现（交互层拦截见 useArticleDetail 的登录门），
 * 待阶段 5 提供 /login 后，由需登录页面通过 `definePageMeta({ middleware: 'auth' })` 挂载。
 */
export default defineNuxtRouteMiddleware((to) => {
  const { isLoggedIn } = useAuth()
  if (isLoggedIn.value) return

  return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
})
