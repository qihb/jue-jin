import type { ApiResp, ArticleFormValue, ArticleSummary } from '~~/shared/types'
import { CONTENT_CATEGORIES } from '~~/shared/constants'
import { createArticle } from '~~/server/db'
import { fail, ok } from '~~/server/utils/resp'

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

/** 发布文章（需登录） */
export default defineEventHandler(async (event): Promise<ApiResp<ArticleSummary>> => {
  const user = event.context.user as { id: string } | null
  if (!user) {
    return fail('请先登录', 401)
  }

  const body = await readBody<Partial<ArticleFormValue> | undefined>(event)

  const title = body?.title?.trim() ?? ''
  const content = body?.content?.trim() ?? ''
  if (!title) return fail('文章标题不能为空', 400)
  if (!content) return fail('文章正文不能为空', 400)

  const categoryId = CONTENT_CATEGORIES.some((item) => item.id === body?.categoryId)
    ? (body?.categoryId as string)
    : (CONTENT_CATEGORIES[0]?.id ?? 'frontend')

  const tags = Array.isArray(body?.tags)
    ? body.tags.filter((tag): tag is string => typeof tag === 'string' && tag.trim() !== '')
    : []
  const brief = body?.brief?.trim() || deriveBrief(content)

  const created = createArticle(
    {
      title,
      content,
      brief,
      cover: body?.cover?.trim() ?? '',
      categoryId,
      tags,
    },
    user.id,
  )

  return ok(created)
})
