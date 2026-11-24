import { listArticles, listBooks, listPins, listTags } from '~~/server/db'
import type { CursorPage } from '~~/shared/types'

/** 单页拉取上限：mock 数据量有限，循环拉全量即可，无需并发优化 */
const PAGE_SIZE = 100

/** 按游标循环拉取，收集某一类资源的全部条目 */
function collectAll<T>(fetchPage: (cursor: string) => CursorPage<T>): T[] {
  const all: T[] = []
  let page = fetchPage('')
  all.push(...page.list)
  while (page.hasMore) {
    page = fetchPage(page.cursor)
    all.push(...page.list)
  }
  return all
}

/**
 * 动态 sitemap 数据源：向 @nuxtjs/sitemap 提供文章 / 沸点 / 小册 / 标签的详情页 URL。
 * 静态路由（首页、沸点列表、排行榜等）由模块从页面文件自动生成，此处只补动态部分。
 */
export default defineSitemapEventHandler(() => {
  const articles = collectAll((cursor) =>
    listArticles({ category: '', sort: 'recommend', limit: PAGE_SIZE, cursor }, null),
  )
  const pins = collectAll((cursor) => listPins({ sort: 'recommend', limit: PAGE_SIZE, cursor }, null))
  const books = collectAll((cursor) => listBooks({ limit: PAGE_SIZE, cursor }))
  const tags = collectAll((cursor) => listTags({ limit: PAGE_SIZE, cursor }))

  return [
    ...articles.map((article) => ({
      loc: `/article/${article.id}`,
      lastmod: article.createdAt,
    })),
    ...pins.map((pin) => ({ loc: `/pin/${pin.id}`, lastmod: pin.createdAt })),
    ...books.map((book) => ({ loc: `/book/${book.id}`, lastmod: book.createdAt })),
    ...tags.map((tag) => ({ loc: `/tag/${tag.name}` })),
  ]
})
