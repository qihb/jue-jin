import { SignJWT, jwtVerify } from 'jose'
import type { H3Event } from 'h3'
import type { UserBrief } from '~~/shared/types'

/** JWT 密钥：优先读环境变量，缺省用开发占位值（生产环境务必通过 env 覆盖） */
const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-secret-change-in-production'
const JWT_EXPIRES_IN = '7d'

/** Cookie 名 */
export const AUTH_COOKIE_NAME = 'jj-token'

const secretKey = new TextEncoder().encode(JWT_SECRET)

/** 签发 JWT，payload 仅含用户 id 与简要信息 */
export async function signToken(user: UserBrief): Promise<string> {
  return new SignJWT({
    sub: user.id,
    username: user.username,
    nickname: user.nickname,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(secretKey)
}

/** 校验 JWT 并返回用户 id，失败返回 null */
export async function verifyToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey)
    return typeof payload.sub === 'string' ? payload.sub : null
  } catch {
    return null
  }
}

/** 签发 token 并写入 HttpOnly Cookie（登录 / 注册共用） */
export async function issueAuthCookie(event: H3Event, user: UserBrief): Promise<void> {
  const token = await signToken(user)
  setCookie(event, AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 天
  })
}
