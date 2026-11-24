import type { ApiResp, CreatorOverview } from '~~/shared/types'
import { MOCK_BASE_TIME } from '~~/shared/constants'
import { db } from '~~/server/mock/seed'
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
 * 阶段 7 占位当前用户（取首个 mock 用户），阶段 5 改为按 token 解析。
 */
export default defineEventHandler((): ApiResp<CreatorOverview> => {
  const [current] = db.users
  const articles = current ? db.articles.filter((item) => item.author.id === current.id) : []

  let totalView = 0
  let totalLike = 0
  let totalCollect = 0
  let totalComment = 0
  for (const article of articles) {
    totalView += article.viewCount
    totalLike += article.likeCount
    totalCollect += article.collectCount
    totalComment += article.commentCount
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
