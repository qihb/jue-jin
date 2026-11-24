import tailwindcss from '@tailwindcss/vite'

/** 站点根地址：生产环境通过 NUXT_PUBLIC_SITE_URL 覆盖，用于 sitemap 与绝对链接 */
const SITE_URL = process.env.NUXT_PUBLIC_SITE_URL || 'http://121.43.208.113:3000'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@pinia/nuxt', '@vueuse/nuxt', '@nuxt/icon', '@nuxt/eslint', '@nuxtjs/sitemap'],

  runtimeConfig: {
    public: {
      siteUrl: SITE_URL,
    },
  },

  /** SEO 站点信息（nuxt-site-config）：sitemap 与 OG 标签的基准地址 */
  site: {
    url: SITE_URL,
    name: '掘金',
    description: '掘金是面向开发者的技术社区，提供前端、后端、Android、iOS、人工智能等领域的优质技术内容。',
  },

  sitemap: {
    // 静态路由由模块从页面文件生成，动态详情页走该数据源
    sources: ['/api/_sitemap-urls'],
    // 需登录的私有页不进 sitemap（与 robots.txt 的 Disallow 保持一致）
    exclude: ['/creator', '/editor', '/editor/**', '/notification', '/collection', '/collection/**'],
  },

  css: [
    '~/assets/css/main.css',
    '~/assets/css/markdown.css',
    // ByteMD 编辑器样式（仅编辑器页使用，类名统一 bytemd- 前缀，不污染全站）
    'bytemd/dist/index.css',
  ],

  components: [
    // base/ → BaseButton、article/ → ArticleCard …
    { path: '~/components', pathPrefix: true },
    // layout/ 不加目录前缀：AppHeader / AppFooter / AppSidebar
    { path: '~/components/layout', pathPrefix: false },
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },

  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      title: '掘金 - 一个帮助开发者成长的社区',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            '掘金是面向开发者的技术社区，提供前端、后端、Android、iOS、人工智能等领域的优质技术内容。',
        },
        { name: 'robots', content: 'index, follow' },
        // 站点级社交分享默认值；页面级 og:title / og:description 由 usePageSeo 覆盖
        { property: 'og:site_name', content: '掘金' },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary' },
      ],
    },
  },
})
