import type { Category } from '../types'

/** 「推荐」聚合流 id */
export const RECOMMEND_CATEGORY_ID = 'recommend'

/** 「关注」聚合流 id */
export const FOLLOW_CATEGORY_ID = 'follow'

/** 首页内容流分类：`recommend` / `follow` 为聚合流，其余按分类聚合 */
export const FEED_CATEGORIES: readonly Category[] = [
  { id: RECOMMEND_CATEGORY_ID, name: '推荐' },
  { id: FOLLOW_CATEGORY_ID, name: '关注' },
  { id: 'backend', name: '后端' },
  { id: 'frontend', name: '前端' },
  { id: 'android', name: 'Android' },
  { id: 'ios', name: 'iOS' },
  { id: 'ai', name: '人工智能' },
  { id: 'tools', name: '开发工具' },
  { id: 'code-life', name: '代码人生' },
  { id: 'reading', name: '阅读' },
]

/** 真实内容分类（排除「推荐」「关注」两个聚合流） */
export const CONTENT_CATEGORIES: readonly Category[] = FEED_CATEGORIES.filter(
  (category) => category.id !== RECOMMEND_CATEGORY_ID && category.id !== FOLLOW_CATEGORY_ID,
)

/** 默认内容流分类 */
export const DEFAULT_CATEGORY_ID = RECOMMEND_CATEGORY_ID

/** 按分类 id 取分类名（找不到时返回空串） */
export function getCategoryName(id: string): string {
  return FEED_CATEGORIES.find((category) => category.id === id)?.name ?? ''
}
