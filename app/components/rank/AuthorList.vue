<script setup lang="ts">
import type { AuthorRankItem } from '~~/shared/types'

defineProps<{ authors: AuthorRankItem[] }>()
</script>

<template>
  <ul class="divide-y divide-jj-border">
    <li v-for="item in authors" :key="item.user.id" class="flex items-center gap-3 px-4 py-3">
      <span
        class="w-6 shrink-0 text-center text-sm font-semibold"
        :class="item.rank <= 3 ? 'text-jj-gold' : 'text-jj-text-3'"
      >
        {{ item.rank }}
      </span>
      <BaseAvatar :src="item.user.avatar" :size="40" />
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-medium text-jj-text-1">{{ item.user.nickname }}</p>
        <p class="truncate text-xs text-jj-text-3">{{ item.user.description }}</p>
      </div>
      <div class="shrink-0 text-right">
        <p class="text-sm font-medium text-jj-text-1">{{ formatCount(item.power) }}</p>
        <p class="text-xs text-jj-text-3">掘力值</p>
      </div>
      <span class="flex w-14 shrink-0 items-center justify-end gap-0.5 text-xs text-jj-success">
        <Icon name="i-lucide:trending-up" class="size-3.5" />
        {{ item.trend }}
      </span>
    </li>
  </ul>
</template>
