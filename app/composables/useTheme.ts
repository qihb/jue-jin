import type { ThemeMode } from '~/stores/app'

const THEME_COOKIE = 'jj-theme'

/**
 * 主题：Pinia 持有状态，cookie 负责 SSR/CSR 持久化（服务端可直接读到，避免闪烁）。
 * 在根组件调用一次并据此设置 `<html>` 的 class；其余组件只用 isDark / toggleTheme。
 */
export function useTheme() {
  const appStore = useAppStore()

  const cookie = useCookie<ThemeMode>(THEME_COOKIE, {
    default: () => 'light',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })

  // 以 cookie 为准回填 store，保证首屏 SSR 与客户端一致
  if (appStore.theme !== cookie.value) {
    appStore.setTheme(cookie.value)
  }

  const theme = computed(() => appStore.theme)
  const isDark = computed(() => appStore.theme === 'dark')

  function setTheme(value: ThemeMode) {
    appStore.setTheme(value)
    cookie.value = value
  }

  function toggleTheme() {
    setTheme(isDark.value ? 'light' : 'dark')
  }

  return { theme, isDark, setTheme, toggleTheme }
}
