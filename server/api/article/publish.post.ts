import type { ApiResp, ArticleFormValue, ArticleSummary } from '~~/shared/types'
import { CONTENT_CATEGORIES, MOCK_BASE_TIME } from '~~/shared/constants'
import { db, toArticleSummary, toUserBrief } from '~~/server/mock/seed'
import { fail, ok } from '~~/server/utils/resp'

/** 新增文章的自增序号（进程内递增，避免与 seed 的 id 冲突） */
let articleSeq = 0

/** 摘要兜底长度 */
const BRIEF_MAX_LENGTH = 80

/** 从 Markdown 正文提取纯文本摘要：去掉代码块 / 标题符号 / 行内标记后截断 */
function deriveBrief(content: string): string {
  return content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/[*_>~-]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, BRIEF_MAX_LENGTH)
}

/** 发布文章：演示登录校验（前端拦截）+ 写入内存 mock 库，返回新文章列表项 */
export default defineEventHandler(async (event): Promise<ApiResp<ArticleSummary>> => {
  const body = await readBody<Partial<ArticleFormValue> | undefined>(event)

  const title = body?.title?.trim() ?? ''
  const content = body?.content?.trim() ?? ''
  if (!title) return fail('文章标题不能为空', 400)
  if (!content) return fail('文章正文不能为空', 400)

  // 阶段 4 占位当前用户，阶段 5 改为按 token 解析
  const [author] = db.users
  if (!author) return fail('用户不存在', 404)

  const categoryId = CONTENT_CATEGORIES.some((item) => item.id === body?.categoryId)
    ? (body?.categoryId as string)
    : (CONTENT_CATEGORIES[0]?.id ?? 'frontend')

  const tags = Array.isArray(body?.tags)
    ? body.tags.filter((tag): tag is string => typeof tag === 'string' && tag.trim() !== '')
    : []
  const brief = body?.brief?.trim() || deriveBrief(content)

  articleSeq += 1
  const createdAt = new Date(MOCK_BASE_TIME).toISOString()

  db.articles.unshift({
    id: `article_new_${articleSeq}`,
    title,
    brief,
    cover: body?.cover?.trim() ?? '',
    categoryId,
    tags,
    author: toUserBrief(author),
    viewCount: 0,
    likeCount: 0,
    commentCount: 0,
    collectCount: 0,
    createdAt,
    isHot: false,
    content,
    liked: false,
    collected: false,
  })
  author.articleCount += 1

  const created = db.articles[0]
  if (!created) return fail('发布失败', 500)
  return ok(toArticleSummary(created))
})
