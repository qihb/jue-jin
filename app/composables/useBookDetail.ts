import type { Ref } from 'vue'
import type { BookDetail } from '~~/shared/types'

/** 小册详情：首屏 `useAsyncData` 取数（SSR 直出），切换 id 时自动重取 */
export async function useBookDetail(id: Ref<string>) {
  const { data, status } = await useAsyncData(
    () => `book-detail:${id.value}`,
    () => request<BookDetail>(`/api/book/${id.value}`),
  )

  const book = computed(() => data.value ?? null)

  return { book, status }
}
