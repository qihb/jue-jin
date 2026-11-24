import type { AuthorRankItem, CursorPage, Tag } from '~~/shared/types'

const AUTHOR_RANK_SIZE = 5
const HOT_TAG_SIZE = 8

/** 右侧栏数据：作者榜 + 热门话题（SSR 首屏取数，接口结果 SSR/CSR 一致） */
export async function useHomeSidebar() {
  // 两处 useAsyncData 必须在同一同步阶段发起：await 之后再调用会丢失 Nuxt 实例（NUXT_E1001）
  const [{ data: rank }, { data: tagPage }] = await Promise.all([
    useAsyncData('sidebar-author-rank', () => request<AuthorRankItem[]>('/api/author/rank')),
    useAsyncData('sidebar-hot-tags', () =>
      request<CursorPage<Tag>>('/api/tag/list', { query: { limit: HOT_TAG_SIZE } }),
    ),
  ])

  const authors = computed(() => (rank.value ?? []).slice(0, AUTHOR_RANK_SIZE))
  const hotTags = computed(() => tagPage.value?.list ?? [])

  return { authors, hotTags }
}
