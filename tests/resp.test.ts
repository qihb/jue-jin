import { describe, expect, it } from 'vitest'
import { fail, normalizeCursorQuery, ok, paginate } from '~~/server/utils/resp'

describe('ok / fail', () => {
  it('ok 返回 err_no = 0', () => {
    expect(ok({ a: 1 })).toEqual({ err_no: 0, err_msg: 'ok', data: { a: 1 } })
  })

  it('fail 返回指定错误码与文案，data 为 null', () => {
    expect(fail('错误', 400)).toEqual({ err_no: 400, err_msg: '错误', data: null })
  })
})

describe('normalizeCursorQuery', () => {
  it('缺省时走默认每页条数，cursor 为空串', () => {
    expect(normalizeCursorQuery({})).toEqual({ limit: 10, cursor: '' })
  })

  it('limit 裁剪到 [1, 50]，非法值回退默认', () => {
    expect(normalizeCursorQuery({ limit: '999' }).limit).toBe(50)
    expect(normalizeCursorQuery({ limit: '3.9' }).limit).toBe(3)
    expect(normalizeCursorQuery({ limit: '0' }).limit).toBe(10)
    expect(normalizeCursorQuery({ limit: '-3' }).limit).toBe(10)
  })

  it('非字符串 cursor 回退为空串', () => {
    expect(normalizeCursorQuery({ cursor: 5 }).cursor).toBe('')
    expect(normalizeCursorQuery({ cursor: 'abc' }).cursor).toBe('abc')
  })
})

describe('paginate', () => {
  const items = [1, 2, 3, 4, 5]

  it('首页返回前 limit 条并给出下一游标', () => {
    expect(paginate(items, { limit: 2, cursor: '' })).toEqual({
      list: [1, 2],
      cursor: '2',
      hasMore: true,
    })
  })

  it('末页 hasMore 为 false 且游标为空串', () => {
    expect(paginate(items, { limit: 2, cursor: '4' })).toEqual({
      list: [5],
      cursor: '',
      hasMore: false,
    })
  })

  it('非法游标回退到首页', () => {
    expect(paginate(items, { limit: 2, cursor: 'abc' })).toEqual({
      list: [1, 2],
      cursor: '2',
      hasMore: true,
    })
  })
})
