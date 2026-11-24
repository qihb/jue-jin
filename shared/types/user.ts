import type { ID } from './common'

/** 用户简要信息：列表 / 卡片 / 作者位等场景 */
export interface UserBrief {
  id: ID
  /** 掘金号（唯一登录标识） */
  username: string
  /** 昵称 */
  nickname: string
  /** 头像地址，空字符串时前端回退为占位图标 */
  avatar: string
  /** 等级 */
  level: number
  /** 一句话简介 */
  description: string
}

/** 用户完整资料 */
export interface User extends UserBrief {
  email: string
  /** 职位 */
  job: string
  /** 公司 */
  company: string
  /** 掘力值 */
  power: number
  /** 关注数 */
  followCount: number
  /** 粉丝数 */
  followerCount: number
  /** 累计获赞数 */
  likedCount: number
  /** 发布文章数 */
  articleCount: number
  /** 注册时间（ISO） */
  createdAt: string
}

/** 关注关系（当前登录用户 → 目标用户） */
export interface FollowState {
  userId: ID
  /** 当前登录用户是否已关注 */
  following: boolean
  /** 目标用户的粉丝数 */
  followerCount: number
}

/** 作者榜条目 */
export interface AuthorRankItem {
  /** 名次，从 1 开始 */
  rank: number
  user: UserBrief
  /** 掘力值 */
  power: number
  /** 较上期提升的掘力值 */
  trend: number
}
