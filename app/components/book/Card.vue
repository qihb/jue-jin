<script setup lang="ts">
import type { BookSummary } from '~~/shared/types'

const props = defineProps<{ book: BookSummary }>()
</script>

<template>
  <NuxtLink
    :to="`/book/${props.book.id}`"
    class="group flex gap-4 px-4 py-4 transition-colors hover:bg-jj-bg-hover"
  >
    <img
      v-if="props.book.cover"
      :src="props.book.cover"
      :alt="props.book.title"
      class="h-24 w-18 shrink-0 rounded object-cover"
      loading="lazy"
    >

    <div class="flex min-w-0 flex-1 flex-col">
      <div class="flex items-center gap-2">
        <h3 class="line-clamp-1 text-base font-medium text-jj-text-1 group-hover:text-jj-primary">
          {{ props.book.title }}
        </h3>
        <BaseTag v-if="props.book.finished" tone="success">已完更</BaseTag>
      </div>

      <p class="mt-1.5 line-clamp-2 text-sm text-jj-text-3">{{ props.book.description }}</p>

      <div class="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-3 text-xs text-jj-text-3">
        <span class="flex items-center gap-1">
          <BaseAvatar :src="props.book.author.avatar" :size="20" />
          <span class="text-jj-text-2">{{ props.book.author.nickname }}</span>
        </span>
        <span class="flex items-center gap-1">
          <Icon name="i-lucide:book-open" class="size-3.5" />
          {{ props.book.sectionCount }} 节
        </span>
        <span class="flex items-center gap-1">
          <Icon name="i-lucide:users" class="size-3.5" />
          {{ formatCount(props.book.learnerCount) }} 人学习
        </span>
        <span class="ml-auto font-medium text-jj-primary">{{ formatPrice(props.book.price) }}</span>
      </div>
    </div>
  </NuxtLink>
</template>
