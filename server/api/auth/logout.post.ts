import type { ApiResp } from '~~/shared/types'
import { AUTH_COOKIE_NAME } from '../../utils/auth'
import { ok } from '../../utils/resp'

/** 登出：清除 JWT Cookie */
export default defineEventHandler((event): ApiResp<null> => {
  deleteCookie(event, AUTH_COOKIE_NAME)
  return ok(null)
})
