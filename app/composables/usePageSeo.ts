import type { MaybeRefOrGetter } from 'vue'

interface PageSeo {
  title: MaybeRefOrGetter<string>
  description: MaybeRefOrGetter<string>
}

/**
 * 页面 SEO 统一入口：一次写入 `<title>` / `description` 与 og / twitter 社交分享标签，
 * 并补上指向当前页的 canonical 链接。
 * 站点级默认（og:site_name、twitter:card、robots）由 `nuxt.config` 的 `app.head` 提供。
 */
export function usePageSeo(seo: PageSeo) {
  const route = useRoute()
  const siteUrl = useRuntimeConfig().public.siteUrl

  useSeoMeta({
    title: seo.title,
    description: seo.description,
    ogTitle: seo.title,
    ogDescription: seo.description,
    twitterTitle: seo.title,
    twitterDescription: seo.description,
  })

  useHead({
    link: [{ rel: 'canonical', href: `${siteUrl}${route.path}` }],
  })
}
