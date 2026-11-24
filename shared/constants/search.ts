import type { SearchType } from '../types'

/** 搜索分类 Tab */
export const SEARCH_TYPES: readonly { id: SearchType; name: string }[] = [
  { id: 'all', name: '综合' },
  { id: 'article', name: '文章' },
  { id: 'user', name: '用户' },
  { id: 'tag', name: '标签' },
  { id: 'book', name: '小册' },
]

/** 默认搜索分类 */
export const DEFAULT_SEARCH_TYPE: SearchType = 'all'

/** 类型守卫：把 URL query 里的字符串收窄为 SearchType */
export function isSearchType(value: unknown): value is SearchType {
  return typeof value === 'string' && SEARCH_TYPES.some((item) => item.id === value)
}

/** 按分类 id 取展示名（找不到时返回「综合」） */
export function getSearchTypeName(id: SearchType): string {
  return SEARCH_TYPES.find((item) => item.id === id)?.name ?? '综合'
}
