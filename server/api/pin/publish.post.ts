import type { ApiResp, PinDetail, PinPublishPayload } from '~~/shared/types'
import {
  PIN_CONTENT_MAX_LENGTH,
  PIN_IMAGE_MAX_COUNT,
  PIN_TOPIC_MAX_COUNT,
} from '~~/shared/constants'
import { createPin } from '~~/server/db'
import { fail, ok } from '~~/server/utils/resp'

/** 把请求体里的候选值收敛为「去空后的字符串数组」 */
function toStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter((item) => item !== '')
}

/** 发布沸点（需登录） */
export default defineEventHandler(async (event): Promise<ApiResp<PinDetail>> => {
  const user = event.context.user as { id: string } | null
  if (!user) {
    return fail('请先登录', 401)
  }

  const body = await readBody<Partial<PinPublishPayload> | undefined>(event)

  const content = body?.content?.trim() ?? ''
  if (!content) return fail('沸点内容不能为空', 400)
  if (content.length > PIN_CONTENT_MAX_LENGTH) {
    return fail(`沸点内容不能超过 ${PIN_CONTENT_MAX_LENGTH} 字`, 400)
  }

  const images = toStringList(body?.images)
  if (images.length > PIN_IMAGE_MAX_COUNT) {
    return fail(`配图最多 ${PIN_IMAGE_MAX_COUNT} 张`, 400)
  }

  const topics = toStringList(body?.topics)
  if (topics.length > PIN_TOPIC_MAX_COUNT) {
    return fail(`话题最多 ${PIN_TOPIC_MAX_COUNT} 个`, 400)
  }

  const created = createPin({ content, images, topics }, user.id)
  return ok(created)
})
