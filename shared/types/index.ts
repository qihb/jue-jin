/** 服务端统一响应体：`err_no === 0` 表示成功 */
export interface ApiResp<T> {
  err_no: number
  err_msg: string
  data: T
}

/** 游标分页统一返回结构 */
export interface CursorPage<T> {
  list: T[]
  cursor: string
  hasMore: boolean
}
