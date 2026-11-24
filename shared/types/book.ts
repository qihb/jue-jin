import type { ID } from './common'
import type { UserBrief } from './user'

/** 小册（掘金课程）列表项 */
export interface BookSummary {
  id: ID
  title: string
  /** 封面图地址，空字符串表示无封面 */
  cover: string
  description: string
  author: UserBrief
  /** 关联标签名列表（不含 #），与 Tag.name 对应 */
  tags: string[]
  /** 价格（单位：分），0 表示免费 */
  price: number
  /** 是否已完更 */
  finished: boolean
  /** 章节数 */
  sectionCount: number
  /** 学习人数 */
  learnerCount: number
  /** 收藏数 */
  collectCount: number
  /** 上架时间（ISO） */
  createdAt: string
}

/** 小册章节 */
export interface BookSection {
  id: ID
  title: string
  /** 是否免费试读 */
  free: boolean
  /** 章节阅读数 */
  viewCount: number
}

/** 小册详情（含章节目录） */
export interface BookDetail extends BookSummary {
  sections: BookSection[]
}
