import { getUserById } from '../db'
import { AUTH_COOKIE_NAME, verifyToken } from '../utils/auth'

/**
 * 登录态中间件：从 Cookie 解析 JWT，校验后把当前用户挂到 event.context。
 * 未登录或 token 无效时 user 为 null，由各接口自行决定是否拦截。
 */
export default defineEventHandler(async (event) => {
  const token = getCookie(event, AUTH_COOKIE_NAME)
  if (!token) {
    event.context.user = null
    return
  }
  const userId = await verifyToken(token)
  if (!userId) {
    event.context.user = null
    return
  }
  event.context.user = getUserById(userId)
})
