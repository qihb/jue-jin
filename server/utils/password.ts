import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

/** 派生密钥长度（字节） */
const KEY_LENGTH = 64

/**
 * 生成密码哈希，格式 `salt:hash`（均为 hex）。
 * 使用 Node 内置 `scrypt`，零新增依赖。
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, KEY_LENGTH).toString('hex')
  return `${salt}:${hash}`
}

/** 校验密码：恒定时间比较；存储格式非法时直接判失败 */
export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false

  const target = Buffer.from(hash, 'hex')
  const derived = scryptSync(password, salt, target.length)
  return target.length === derived.length && timingSafeEqual(target, derived)
}
