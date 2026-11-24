import type { ApiResp, PinDetail } from '~~/shared/types'
import { getPinById } from '~~/server/db'
import { fail, ok } from '~~/server/utils/resp'

/** 沸点详情 */
export default defineEventHandler((event): ApiResp<PinDetail | null> => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    return fail('缺少沸点 ID', 400)
  }
  const userId = (event.context.user as { id: string } | null)?.id ?? null
  const pin = getPinById(id, userId)
  if (!pin) {
    return fail('沸点不存在', 404)
  }
  return ok(pin)
})
