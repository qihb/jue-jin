<script setup lang="ts">
const currentYear = new Date().getFullYear()

const FOOTER_LINKS = ['关于我们', '用户协议', '隐私政策', '友情链接'] as const
</script>

<template>
  <footer class="border-t border-jj-border bg-jj-bg-card py-8">
    <div class="mx-auto max-w-[1440px] px-4 text-center text-xs leading-6 text-jj-text-3">
      <p>
        <span
          v-for="(link, index) in FOOTER_LINKS"
          :key="link"
          class="transition-colors hover:text-jj-primary"
        >
          {{ link }}<span v-if="index < FOOTER_LINKS.length - 1" class="mx-2">·</span>
        </span>
      </p>
      <p class="mt-2">© {{ currentYear }} 掘金复刻 · 基于 Nuxt 4 的学习演示项目，非官方站点</p>
    </div>
  </footer>
</template>
