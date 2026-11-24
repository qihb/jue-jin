import { assertJwtSecretConfigured } from '../utils/auth'

/**
 * 启动守卫：生产环境未注入 JWT_SECRET 时，服务启动即失败，
 * 避免带着弱密钥静默运行、直到首次登录才暴露问题。
 */
export default defineNitroPlugin(() => {
  assertJwtSecretConfigured()
})
