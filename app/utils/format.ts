import { MOCK_BASE_TIME } from '~~/shared/constants'

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/**
 * 相对时间：以 mock 基准时间为「现在」，
 * 避免用 `Date.now()` 造成 SSR 与 CSR 渲染结果不一致。
 */
export function formatRelativeTime(iso: string): string {
  const diff = MOCK_BASE_TIME - new Date(iso).getTime()
  if (diff < HOUR) return `${Math.max(1, Math.floor(diff / MINUTE))}分钟前`
  if (diff < DAY) return `${Math.floor(diff / HOUR)}小时前`
  if (diff < 30 * DAY) return `${Math.floor(diff / DAY)}天前`
  if (diff < 365 * DAY) return `${Math.floor(diff / (30 * DAY))}个月前`
  return `${Math.floor(diff / (365 * DAY))}年前`
}

/** 数字缩写：10000 以上按「万」展示 */
export function formatCount(value: number): string {
  if (value < 10_000) return String(value)
  return `${Number((value / 10_000).toFixed(1))}万`
}
