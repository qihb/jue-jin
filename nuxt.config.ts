import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@pinia/nuxt', '@vueuse/nuxt', '@nuxt/icon', '@nuxt/eslint'],

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
      ],
    },
  },
})
