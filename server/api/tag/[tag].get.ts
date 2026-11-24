import type { ApiResp, TagDetail } from '~~/shared/types'
import { getTagByName, listArticlesByTag } from '~~/server/db'
import { fail, normalizeCursorQuery, ok } from '~~/server/utils/resp'

/** URL 中的标签名可能被编码（中文标签），解码失败时回退原值 */
function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

/** 标签详情：标签信息 + 标签下文章流（游标分页） */
export default defineEventHandler((event): ApiResp<TagDetail | null> => {
  const raw = getRouterParam(event, 'tag')
  if (!raw) {
    return fail('缺少标签名', 400)
  }

  const tag = getTagByName(safeDecode(raw))
  if (!tag) {
    return fail('标签不存在', 404)
  }

  const params = normalizeCursorQuery(getQuery(event))
  const userId = (event.context.user as { id: string } | null)?.id ?? null
  return ok({ tag, articles: listArticlesByTag(tag.name, params, userId) })
})
