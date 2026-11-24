import type { UserProfileTab } from '../types'

/** 用户主页 Tab 项 */
export interface UserProfileTabItem {
  label: string
  value: UserProfileTab
}

/** 用户主页 Tab 列表 */
export const USER_PROFILE_TABS: readonly UserProfileTabItem[] = [
  { label: '文章', value: 'articles' },
  { label: '沸点', value: 'pins' },
  { label: '收藏集', value: 'collections' },
  { label: '赞过', value: 'likes' },
  { label: '关注', value: 'following' },
]

/** 用户主页默认 Tab */
export const DEFAULT_USER_PROFILE_TAB: UserProfileTab = 'articles'

/** 类型守卫：把 URL query 里的字符串收窄为 UserProfileTab */
export function isUserProfileTab(value: unknown): value is UserProfileTab {
  return typeof value === 'string' && USER_PROFILE_TABS.some((item) => item.value === value)
}

/** 沸点正文最大长度 */
export const PIN_CONTENT_MAX_LENGTH = 500

/** 沸点配图最大张数 */
export const PIN_IMAGE_MAX_COUNT = 9

/** 沸点话题最大数量 */
export const PIN_TOPIC_MAX_COUNT = 5

/** 沸点话题推荐池（发布页供选择，也允许自由输入） */
export const PIN_TOPIC_SUGGESTIONS: readonly string[] = [
  '前端',
  'Vue 3',
  'React',
  'TypeScript',
  'Node.js',
  'Vite',
  '算法',
  '大模型',
  '开发工具',
  '代码人生',
]

/** 用户名规则：4~20 位字母 / 数字 / 下划线 */
export const USERNAME_PATTERN = /^[a-zA-Z0-9_]{4,20}$/

/** 密码最短长度 */
export const PASSWORD_MIN_LENGTH = 6

/** 昵称最大长度 */
export const NICKNAME_MAX_LENGTH = 20

/** 个人简介最大长度 */
export const USER_DESCRIPTION_MAX_LENGTH = 100

/** 邮箱格式（仅做基础校验，非空时生效） */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
