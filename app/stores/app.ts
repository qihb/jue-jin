/** 主题模式（供 useTheme 与 html class 使用） */
export type ThemeMode = 'light' | 'dark'

/** 全局 UI 状态：主题、移动端抽屉、访问计数等跨页面共享状态 */
export const useAppStore = defineStore('app', () => {
  const theme = ref<ThemeMode>('light')
  const visitCount = ref(0)
  /** 移动端导航抽屉开关（< lg 生效） */
  const mobileNavOpen = ref(false)

  function setTheme(value: ThemeMode) {
    theme.value = value
  }

  function toggleTheme() {
    setTheme(theme.value === 'light' ? 'dark' : 'light')
  }

  function openMobileNav() {
    mobileNavOpen.value = true
  }

  function closeMobileNav() {
    mobileNavOpen.value = false
  }

  function incrementVisit() {
    visitCount.value += 1
  }

  return {
    theme,
    visitCount,
    mobileNavOpen,
    setTheme,
    toggleTheme,
    openMobileNav,
    closeMobileNav,
    incrementVisit,
  }
})
