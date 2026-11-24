import type { PinDetail, PinPublishPayload } from '~~/shared/types'

/**
 * 发布沸点：请求写在 composable 内（组件不直连接口），成功后跳转到沸点详情页。
 * 页面已挂 `middleware/auth`，进入即登录态，无需再做登录拦截。
 */
export function usePinPublish() {
  const publishing = ref(false)

  async function publish(payload: PinPublishPayload): Promise<boolean> {
    if (publishing.value) return false
    publishing.value = true
    try {
      const pin = await request<PinDetail>('/api/pin/publish', {
        method: 'POST',
        body: { content: payload.content, images: payload.images, topics: payload.topics },
      })
      await navigateTo(`/pin/${pin.id}`)
      return true
    } finally {
      publishing.value = false
    }
  }

  return { publishing, publish }
}
