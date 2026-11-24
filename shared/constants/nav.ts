/** 顶部导航项（AppHeader 横向导航与移动端抽屉共用） */
export interface NavItem {
  label: string
  to: string
  icon: string
  /** 是否为外链（跳转到 juejin.cn 真实地址，新标签页打开） */
  external?: boolean
}

/**
 * 顶部导航：与掘金官网保持一致。
 * - 前 3 项为本项目自实现页面，同标签页打开
 * - 后 4 项为掘金官网真实地址，新标签页打开
 */
export const NAV_ITEMS: readonly NavItem[] = [
  { label: '首页', to: '/', icon: 'i-lucide:house' },
  { label: '沸点', to: '/pins', icon: 'i-lucide:message-square' },
  { label: '课程', to: '/books', icon: 'i-lucide:book-open' },
  { label: 'APP', to: 'https://juejin.cn/app', icon: 'i-lucide:smartphone', external: true },
  { label: 'AI用量', to: 'https://juejin.cn/ai', icon: 'i-lucide:brain-circuit', external: true },
  { label: '作品广场', to: 'https://juejin.cn/works', icon: 'i-lucide:layout-grid', external: true },
  { label: '专家标注', to: 'https://juejin.cn/expert', icon: 'i-lucide:award', external: true },
]
