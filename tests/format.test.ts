import { describe, expect, it } from 'vitest'
import { MOCK_BASE_TIME } from '~~/shared/constants'
import { formatCount, formatDateTime, formatPrice, formatRelativeTime } from '~/utils/format'

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/** 以 mock 基准时间为「现在」，向前偏移 offsetMs 得到一个 iso 字符串 */
const at = (offsetMs: number) => new Date(MOCK_BASE_TIME - offsetMs).toISOString()

describe('formatRelativeTime', () => {
  it('一小时内按分钟展示，且最小为 1 分钟', () => {
    expect(formatRelativeTime(at(5 * MINUTE))).toBe('5分钟前')
    expect(formatRelativeTime(at(0))).toBe('1分钟前')
  })

  it('一天内按小时展示', () => {
    expect(formatRelativeTime(at(3 * HOUR))).toBe('3小时前')
  })

  it('30 天内按天展示', () => {
    expect(formatRelativeTime(at(5 * DAY))).toBe('5天前')
  })

  it('一年内按月展示', () => {
    expect(formatRelativeTime(at(60 * DAY))).toBe('2个月前')
  })

  it('超过一年按年展示', () => {
    expect(formatRelativeTime(at(400 * DAY))).toBe('1年前')
  })
})

describe('formatCount', () => {
  it('一万以下原样输出', () => {
    expect(formatCount(0)).toBe('0')
    expect(formatCount(9999)).toBe('9999')
  })

  it('一万及以上按「万」缩写', () => {
    expect(formatCount(10_000)).toBe('1万')
    expect(formatCount(12_345)).toBe('1.2万')
  })
})

describe('formatPrice', () => {
  it('非正数展示为免费', () => {
    expect(formatPrice(0)).toBe('免费')
    expect(formatPrice(-100)).toBe('免费')
  })

  it('分转元保留两位小数', () => {
    expect(formatPrice(1999)).toBe('¥19.99')
    expect(formatPrice(100)).toBe('¥1.00')
  })
})

describe('formatDateTime', () => {
  it('按本地时区输出 MM-DD HH:mm', () => {
    const local = new Date(2026, 0, 5, 9, 7)
    expect(formatDateTime(local.toISOString())).toBe('01-05 09:07')
  })
})
