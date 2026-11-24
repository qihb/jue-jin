import type { ApiResp, CursorPage, PinDetail } from '~~/shared/types'
import { DEFAULT_SORT, SORT_FOLLOW, SORT_NEWEST, SORT_RECOMMEND } from '~~/shared/constants'
import { listPins } from '~~/server/db'
import { normalizeCursorQuery, ok } from '~~/server/utils/resp'

type PinSort = 'recommend' | 'newest' | 'follow'

const VALID_SORTS: PinSort[] = [SORT_RECOMMEND, SORT_NEWEST, SORT_FOLLOW]

/** 沸点列表：支持排序方式（sort）+ 游标分页 */
export default defineEventHandler((event): ApiResp<CursorPage<PinDetail>> => {
  const query = getQuery(event)
  const params = normalizeCursorQuery(query)

  const sortRaw = typeof query.sort === 'string' ? query.sort : DEFAULT_SORT
  const sort = VALID_SORTS.includes(sortRaw as PinSort) ? (sortRaw as PinSort) : DEFAULT_SORT

  const userId = (event.context.user as { id: string } | null)?.id ?? null
  return ok(listPins({ sort, ...params }, userId))
})
