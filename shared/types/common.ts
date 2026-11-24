/** 全局主键类型：mock 统一使用字符串 id（如 `article_12`） */
export type ID = string

/** 服务端统一响应体：`err_no === 0` 表示成功 */
export interface ApiResp<T> {
  err_no: number
  err_msg: string
  data: T
}

/** 列表接口的统一查询参数（游标分页） */
export interface CursorQuery {
  /** 每页条数，缺省时由服务端兜底 */
  limit?: number
  /** 游标：取自上一页返回的 cursor，首页传空 */
  cursor?: string
}

/** 归一化后的游标分页参数（服务端内部使用，两字段均必有值） */
export interface CursorParams {
  limit: number
  cursor: string
}

/** 游标分页统一返回结构 */
export interface CursorPage<T> {
  list: T[]
  cursor: string
  hasMore: boolean
}
