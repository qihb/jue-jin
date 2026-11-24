import type { ArticleSummary, AuthorRankItem } from '~~/shared/types'

/**
 * 排行榜：作者掘力榜 + 文章阅读榜。
 * 两处 `useAsyncData` 必须在同一同步阶段并行发起，避免 Nuxt 实例上下文丢失（NUXT_E1001）。
 */
export async function useRank() {
  const [authorRank, articleRank] = await Promise.all([
    useAsyncData('rank-author', () => request<AuthorRankItem[]>('/api/author/rank')),
    useAsyncData('rank-article', () => request<ArticleSummary[]>('/api/rank/article')),
  ])

  const authors = computed(() => authorRank.data.value ?? [])
  const articles = computed(() => articleRank.data.value ?? [])
  const status = computed(() => authorRank.status.value)

  return { authors, articles, status }
}
