/** 创作者中心 · 趋势数据点 */
export interface CreatorTrendPoint {
  /** 日期（MM-DD） */
  date: string
  /** 当日阅读量 */
  value: number
}

/** 创作者中心 · 各指标较前一日的增幅（百分比整数，可为负） */
export interface CreatorTrends {
  view: number
  like: number
  collect: number
  comment: number
}

/** 创作者中心 · 数据概览 */
export interface CreatorOverview {
  totalView: number
  totalLike: number
  totalCollect: number
  totalComment: number
  trends: CreatorTrends
  /** 近 7 日阅读量趋势 */
  viewSeries: CreatorTrendPoint[]
}
