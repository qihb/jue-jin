import type { ApiResp, PinLikeResult } from '~~/shared/types'
import { togglePinLike } from '~~/server/db'
import { fail, ok } from '~~/server/utils/resp'

/** 沸点点赞 / 取消点赞（需登录） */
export default defineEventHandler(async (event): Promise<ApiResp<PinLikeResult>> => {
  const user = event.context.user as { id: string } | null
  if (!user) {
    return fail('请先登录', 401)
  }

  const body = await readBody<{ id?: string } | undefined>(event)
  const pinId = body?.id
  if (!pinId) {
    return fail('沸点 id 不能为空', 400)
  }

  const result = togglePinLike(pinId, user.id)
  return ok(result)
})
