import type { ApiResp, PinDetail } from '~~/shared/types'
import { db } from '~~/server/mock/seed'
import { fail, ok } from '~~/server/utils/resp'

/** 沸点详情 */
export default defineEventHandler((event): ApiResp<PinDetail | null> => {
  const id = getRouterParam(event, 'id')
  const pin = db.pins.find((item) => item.id === id)
  if (!pin) {
    return fail('沸点不存在', 404)
  }
  return ok(pin)
})
