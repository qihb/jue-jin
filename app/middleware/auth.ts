/**
 * 需登录路由守卫：未登录时跳转登录页并带上 redirect。
 * 由需登录页面通过 `definePageMeta({ middleware: 'auth' })` 挂载。
 */
export default defineNuxtRouteMiddleware((to) => {
  const { isLoggedIn } = useAuth()
  if (isLoggedIn.value) return

  return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
})
