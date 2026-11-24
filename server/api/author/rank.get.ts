import type { ApiResp, AuthorRankItem } from '~~/shared/types'
import { listAuthorRank } from '~~/server/db'
import { ok } from '~~/server/utils/resp'

/** 作者榜：按掘力值倒序取前 10 */
export default defineEventHandler((): ApiResp<AuthorRankItem[]> => ok(listAuthorRank()))
