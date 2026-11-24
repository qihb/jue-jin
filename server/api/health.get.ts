import type { ApiResp } from '~~/shared/types'

interface HealthData {
  status: string
  time: string
}

export default defineEventHandler((): ApiResp<HealthData> => {
  return {
    err_no: 0,
    err_msg: 'ok',
    data: { status: 'ok', time: new Date().toISOString() },
  }
})
