/** 全局 UI 状态：主题、访问计数等跨页面共享状态 */
export const useAppStore = defineStore('app', () => {
  const theme = ref<'light' | 'dark'>('light')
  const visitCount = ref(0)

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  function incrementVisit() {
    visitCount.value += 1
  }

  return { theme, visitCount, toggleTheme, incrementVisit }
})
