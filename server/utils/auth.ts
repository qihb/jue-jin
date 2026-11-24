import { SignJWT, jwtVerify } from 'jose'
import type { H3Event } from 'h3'
import type { UserBrief } from '~~/shared/types'

const JWT_EXPIRES_IN = '7d'

/** Cookie 名 */
export const AUTH_COOKIE_NAME = 'jj-token'

let cachedSecretKey: Uint8Array | null = null

const MISSING_SECRET_MESSAGE =
  '缺少环境变量 JWT_SECRET：生产环境必须注入一个足够随机的密钥（可用 `openssl rand -hex 32` 生成）。'

/**
 * 校验生产环境已注入 JWT 密钥：未注入时直接抛错，避免静默使用弱密钥。
 * 由 Nitro 启动插件调用，做到「启动即失败」，而非等到首次登录才报错。
 */
export function assertJwtSecretConfigured(): void {
  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    throw new Error(MISSING_SECRET_MESSAGE)
  }
}

/**
 * 获取 JWT 密钥（惰性缓存）。
 * 生产环境（`NODE_ENV=production`）必须通过环境变量注入 `JWT_SECRET`，缺失时直接抛错；
 * 开发 / 构建阶段回退到占位密钥，便于本地调试。
 */
function getSecretKey(): Uint8Array {
  if (cachedSecretKey) return cachedSecretKey

  const secret = process.env.JWT_SECRET
  if (!secret) {
    assertJwtSecretConfigured()
    cachedSecretKey = new TextEncoder().encode('dev-only-secret-change-in-production')
    return cachedSecretKey
  }

  cachedSecretKey = new TextEncoder().encode(secret)
  return cachedSecretKey
}

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
    .sign(getSecretKey())
}

/** 校验 JWT 并返回用户 id，失败返回 null */
export async function verifyToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey())
    return typeof payload.sub === 'string' ? payload.sub : null
  } catch {
    return null
  }
}

/** 签发 token 并写入 HttpOnly Cookie（登录 / 注册共用） */
export async function issueAuthCookie(event: H3Event, user: UserBrief): Promise<void> {
  const token = await signToken(user)
  const siteUrl = useRuntimeConfig(event).public.siteUrl
  setCookie(event, AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    // 仅在 HTTPS 站点下发 Secure，避免本地 / 内网 HTTP 部署下 Cookie 无法写入
    secure: typeof siteUrl === 'string' && siteUrl.startsWith('https:'),
    maxAge: 60 * 60 * 24 * 7, // 7 天
  })
}
