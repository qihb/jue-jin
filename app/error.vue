<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const isNotFound = computed(() => props.error.statusCode === 404)

useSeoMeta({
  title: () => `${props.error.statusCode ?? 500} · 掘金`,
  description: '出错了',
})

function goHome() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div
    class="flex min-h-screen flex-col items-center justify-center gap-6 bg-jj-bg-page px-6 text-center"
  >
    <p class="text-6xl font-bold text-jj-primary">{{ error.statusCode ?? 500 }}</p>

    <div class="space-y-2">
      <h1 class="text-lg font-semibold text-jj-text-1">
        {{ isNotFound ? '页面走丢了' : '服务出了点问题' }}
      </h1>
      <p class="max-w-md text-sm text-jj-text-2">
        {{ isNotFound ? '你访问的页面不存在或已被删除' : error.statusMessage || '请稍后重试' }}
      </p>
    </div>

    <button
      type="button"
      class="cursor-pointer rounded-jj-card bg-jj-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-jj-primary-hover"
      @click="goHome"
    >
      返回首页
    </button>
  </div>
</template>
