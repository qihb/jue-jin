import { describe, expect, it } from 'vitest'
import { hashPassword, verifyPassword } from '~~/server/utils/password'

describe('password', () => {
  it('哈希格式为 salt:hash，且同一密码每次盐不同', () => {
    const first = hashPassword('secret123')
    const second = hashPassword('secret123')

    expect(first).toMatch(/^[0-9a-f]{32}:[0-9a-f]{128}$/)
    expect(first).not.toBe(second)
  })

  it('正确密码校验通过，错误密码校验失败', () => {
    const stored = hashPassword('secret123')

    expect(verifyPassword('secret123', stored)).toBe(true)
    expect(verifyPassword('secret124', stored)).toBe(false)
  })

  it('存储格式非法时直接判失败', () => {
    expect(verifyPassword('secret123', 'not-a-hash')).toBe(false)
    expect(verifyPassword('secret123', '')).toBe(false)
  })
})
