import type { ApiResp, PinLikeResult } from '~~/shared/types'
import { db } from '~~/server/mock/seed'
import { fail, ok } from '~~/server/utils/resp'

/** 沸点点赞 / 取消点赞：mock 直接改内存态，返回最新结果 */
export default defineEventHandler(async (event): Promise<ApiResp<PinLikeResult>> => {
  const body = await readBody<{ id?: string } | undefined>(event)
  const pin = db.pins.find((item) => item.id === body?.id)
  if (!pin) {
    return fail('沸点不存在', 404)
  }

  pin.liked = !pin.liked
  pin.likeCount = Math.max(0, pin.likeCount + (pin.liked ? 1 : -1))
  return ok({ liked: pin.liked, likeCount: pin.likeCount })
})
