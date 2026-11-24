/** 顶部导航项（AppHeader 横向导航与移动端抽屉共用） */
export interface NavItem {
  label: string
  to: string
  icon: string
}

export const NAV_ITEMS: readonly NavItem[] = [
  { label: '首页', to: '/', icon: 'i-lucide:house' },
  { label: '沸点', to: '/pins', icon: 'i-lucide:message-square' },
  { label: '小册', to: '/books', icon: 'i-lucide:book-open' },
  { label: '收藏集', to: '/collection', icon: 'i-lucide:folder' },
  { label: '排行榜', to: '/rank', icon: 'i-lucide:trophy' },
]
