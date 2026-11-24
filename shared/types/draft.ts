import type { ArticleFormValue } from './article'
import type { ID } from './common'

/** 本地草稿：编辑器内容的本地持久化结构（仅存浏览器，不入服务端） */
export interface ArticleDraft extends ArticleFormValue {
  id: ID
  /** 最后保存时间（ISO） */
  updatedAt: string
}
