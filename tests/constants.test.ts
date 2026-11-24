import { describe, expect, it } from 'vitest'
import {
  DEFAULT_NOTIFICATION_TAB,
  DEFAULT_SEARCH_TYPE,
  emptyNotificationUnread,
  getNotificationTabName,
  getSearchTypeName,
  isNotificationTab,
  isSearchType,
  isUserProfileTab,
} from '~~/shared/constants'

describe('notification 常量', () => {
  it('isNotificationTab 只接受枚举内的分类', () => {
    expect(isNotificationTab('like')).toBe(true)
    expect(isNotificationTab('unknown')).toBe(false)
    expect(isNotificationTab(1)).toBe(false)
  })

  it('getNotificationTabName 返回展示名', () => {
    expect(getNotificationTabName('like')).toBe('赞和收藏')
  })

  it('emptyNotificationUnread 各分类归零', () => {
    const unread = emptyNotificationUnread()
    expect(unread.total).toBe(0)
    expect(Object.values(unread.byTab).every((count) => count === 0)).toBe(true)
  })

  it('默认分类为 like', () => {
    expect(DEFAULT_NOTIFICATION_TAB).toBe('like')
  })
})

describe('search 常量', () => {
  it('isSearchType 收窄合法分类', () => {
    expect(isSearchType('article')).toBe(true)
    expect(isSearchType('nope')).toBe(false)
  })

  it('getSearchTypeName 未知分类回退「综合」', () => {
    expect(getSearchTypeName('all')).toBe('综合')
  })

  it('默认分类为 all', () => {
    expect(DEFAULT_SEARCH_TYPE).toBe('all')
  })
})

describe('user 常量', () => {
  it('isUserProfileTab 收窄合法 Tab', () => {
    expect(isUserProfileTab('articles')).toBe(true)
    expect(isUserProfileTab('bad')).toBe(false)
  })
})
