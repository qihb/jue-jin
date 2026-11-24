<script setup lang="ts">
import { NAV_CATEGORIES } from '~~/shared/constants'

const model = defineModel<string>({ required: true })

/** 分类图标（按 NAV_CATEGORIES 顺序对应） */
const ICON_BY_CATEGORY: Record<string, string> = {
  '': 'i-lucide:layers', // 综合
  backend: 'i-lucide:server',
  frontend: 'i-lucide:layout-template',
  android: 'i-lucide:smartphone',
  ios: 'i-lucide:apple',
  ai: 'i-lucide:brain-circuit',
  tools: 'i-lucide:wrench',
  'code-life': 'i-lucide:coffee',
  reading: 'i-lucide:book-open',
}
</script>

<template>
  <nav class="flex flex-col rounded-jj-card bg-jj-bg-card shadow-jj-card">
    <div class="flex items-center gap-2 border-b border-jj-border px-4 py-3">
      <Icon name="i-lucide:trophy" class="size-4 text-jj-primary" />
      <span class="text-sm font-medium text-jj-text-1">排行榜</span>
    </div>
    <ul class="flex flex-col py-1">
      <li v-for="item in NAV_CATEGORIES" :key="item.id">
        <button
          type="button"
          class="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-jj-bg-hover"
          :class="model === item.id ? 'bg-jj-bg-hover font-medium text-jj-primary' : 'text-jj-text-2'"
          @click="model = item.id"
        >
          <Icon :name="ICON_BY_CATEGORY[item.id] ?? 'i-lucide:circle'" class="size-4" />
          <span>{{ item.name }}</span>
        </button>
      </li>
    </ul>
  </nav>
</template>
