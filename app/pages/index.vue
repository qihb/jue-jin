<script setup lang="ts">
import type { ApiResp } from '~~/shared/types'

interface HealthData {
  status: string
  time: string
}

const appStore = useAppStore()

const colorTokens = ['primary', 'success', 'warning', 'danger', 'text-2', 'bg-page'] as const

const { data: health } = await useAsyncData('stage0-health', () =>
  $fetch<ApiResp<HealthData>>('/api/health'),
)

const healthStatus = computed(() => {
  if (!health.value || health.value.err_no !== 0) return '异常'
  return health.value.data.status
})

const recordVisit = useDebounceFn(() => {
  appStore.incrementVisit()
}, 200)

useSeoMeta({
  title: '掘金 - 一个帮助开发者成长的社区',
  description: '掘金复刻 · 阶段 0 环境自检页。',
})
</script>

<template>
  <div>
    <section class="mx-auto max-w-3xl rounded-jj-card bg-jj-bg-card p-6 shadow-jj-card">
      <header class="flex items-center gap-2">
        <Icon name="i-lucide:file-text" class="size-6 text-jj-primary" />
        <h1 class="text-xl font-medium text-jj-text-1">掘金复刻 · 阶段 0 环境自检</h1>
      </header>

      <p class="mt-2 text-sm text-jj-text-3">
        Nuxt 4 · Tailwind v4 · Pinia · VueUse · @nuxt/icon · Nitro mock 已接入
      </p>

      <dl class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div class="rounded-jj-card border border-jj-border p-4">
          <dt class="text-xs text-jj-text-3">Pinia 状态（VueUse 防抖触发）</dt>
          <dd class="mt-2 flex items-center gap-3">
            <span class="text-lg font-medium text-jj-text-1">访问 {{ appStore.visitCount }}</span>
            <button
              type="button"
              class="rounded-jj-card bg-jj-primary px-3 py-1 text-xs text-white"
              @click="recordVisit"
            >
              记录一次
            </button>
          </dd>
        </div>

        <div class="rounded-jj-card border border-jj-border p-4">
          <dt class="text-xs text-jj-text-3">Nitro mock 接口</dt>
          <dd class="mt-2 text-lg font-medium text-jj-text-1">/api/health → {{ healthStatus }}</dd>
        </div>
      </dl>

      <ul class="mt-6 flex flex-wrap gap-4">
        <li
          v-for="token in colorTokens"
          :key="token"
          class="flex items-center gap-1.5 text-xs text-jj-text-3"
        >
          <span
            class="inline-block size-3 rounded-full ring-1 ring-jj-border"
            :style="{ backgroundColor: `var(--color-jj-${token})` }"
          />
          {{ token }}
        </li>
      </ul>
    </section>
  </div>
</template>
