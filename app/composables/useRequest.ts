import type { ApiResp } from '~~/shared/types'

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

/** 统一请求参数 */
export interface RequestOptions {
  method?: RequestMethod
  /** URL query 参数 */
  query?: Record<string, unknown>
  /** 请求体 */
  body?: Record<string, unknown>
  headers?: Record<string, string>
}

/**
 * 统一请求封装：集中解包 `{ err_no, err_msg, data }`。
 * `err_no !== 0` 时抛出异常，调用方直接拿到业务数据。
 * SSR 下改用 `useRequestFetch`，把入站 Cookie 透传给内部接口，才能拿到真实登录态。
 */
export async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', query, body, headers } = options
  const fetcher = import.meta.server ? useRequestFetch() : $fetch
  const resp = await fetcher<ApiResp<T>>(url, { method, query, body, headers })

  if (resp.err_no !== 0) {
    throw createError({ statusMessage: resp.err_msg, data: resp })
  }
  return resp.data
}

/** 组合式入口：全站请求统一走这里 */
export function useRequest() {
  return { request }
}

/** SSR 首屏取数：`useAsyncData` + 解包封装，页面内一行取数 */
export function useApiData<T>(key: string, url: string, options: RequestOptions = {}) {
  return useAsyncData<T>(key, () => request<T>(url, options))
}
