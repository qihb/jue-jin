import type { ApiResp, CursorPage, CursorParams } from '~~/shared/types'
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '~~/shared/constants'

/** 构造成功响应（`err_no === 0`） */
export function ok<T>(data: T): ApiResp<T> {
  return { err_no: 0, err_msg: 'ok', data }
}

/** 构造失败响应（`err_no !== 0`，data 恒为 null，调用方只读 err_msg） */
export function fail<T = null>(errMsg: string, errNo = 1): ApiResp<T> {
  return { err_no: errNo, err_msg: errMsg, data: null as unknown as T }
}

/** 归一化游标分页参数：limit 兜底并裁剪到 [1, MAX_PAGE_SIZE]，非法 cursor 回退到首页 */
export function normalizeCursorQuery(query: Record<string, unknown>): CursorParams {
  const rawLimit = Number(query.limit)
  const limit =
    Number.isFinite(rawLimit) && rawLimit > 0
      ? Math.min(Math.floor(rawLimit), MAX_PAGE_SIZE)
      : DEFAULT_PAGE_SIZE
  const cursor = typeof query.cursor === 'string' ? query.cursor : ''
  return { limit, cursor }
}

/** 基于下标的游标分页：mock 数据为内存数组，cursor 即下一条的起始下标 */
export function paginate<T>(items: readonly T[], params: CursorParams): CursorPage<T> {
  const parsed = Number.parseInt(params.cursor, 10)
  const start = Number.isFinite(parsed) && parsed > 0 ? parsed : 0
  const list = items.slice(start, start + params.limit)
  const next = start + list.length
  const hasMore = next < items.length
  return { list, cursor: hasMore ? String(next) : '', hasMore }
}
