import type { ApiResp, CreatorOverview } from '~~/shared/types'
import { MOCK_BASE_TIME } from '~~/shared/constants'
import { getUserById, listArticlesByAuthor } from '~~/server/db'
import { ok } from '~~/server/utils/resp'

/** 近 7 日趋势天数 */
const TREND_DAYS = 7

/** 「MM-DD」日期（相对基准时间偏移天数） */
function formatDay(offsetDay: number): string {
  const date = new Date(MOCK_BASE_TIME + offsetDay * 86_400_000)
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${month}-${day}`
}

/** 由总量确定性推导增幅百分比（无随机，保证 SSR / CSR 一致） */
function deriveTrend(total: number, seed: number): number {
  return ((total + seed) % 23) - 8
}

/**
 * 创作者中心 · 数据概览。
 * 当前用户取自登录态（event.context.user），未登录时返回空概览。
 */
export default defineEventHandler((event): ApiResp<CreatorOverview> => {
  const user = event.context.user as { id: string } | null
  const current = user ? getUserById(user.id) : null

  let totalView = 0
  let totalLike = 0
  let totalCollect = 0
  let totalComment = 0

  if (current) {
    const page = listArticlesByAuthor(current.id, { limit: 1000, cursor: '' }, null)
    for (const article of page.list) {
      totalView += article.viewCount
      totalLike += article.likeCount
      totalCollect += article.collectCount
      totalComment += article.commentCount
    }
  }

  const daily = Math.round(totalView / TREND_DAYS)
  const viewSeries = Array.from({ length: TREND_DAYS }, (_, index) => ({
    date: formatDay(index - TREND_DAYS + 1),
    value: Math.max(0, daily + (((totalView + index * 37) % 11) - 5) * 10),
  }))

  return ok({
    totalView,
    totalLike,
    totalCollect,
    totalComment,
    trends: {
      view: deriveTrend(totalView, 3),
      like: deriveTrend(totalLike, 7),
      collect: deriveTrend(totalCollect, 11),
      comment: deriveTrend(totalComment, 5),
    },
    viewSeries,
  })
})
