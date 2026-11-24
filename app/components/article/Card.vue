<script setup lang="ts">
import type { ArticleSummary } from '~~/shared/types'
import { getCategoryName } from '~~/shared/constants'

const props = defineProps<{ article: ArticleSummary }>()

const categoryName = computed(() => getCategoryName(props.article.categoryId))
</script>

<template>
  <NuxtLink
    :to="`/article/${props.article.id}`"
    class="group flex gap-4 px-4 py-4 transition-colors hover:bg-jj-bg-hover"
  >
    <div class="flex min-w-0 flex-1 flex-col">
      <div class="flex flex-wrap items-center gap-2 text-xs text-jj-text-3">
        <span v-if="categoryName">{{ categoryName }}</span>
        <BaseTag v-if="props.article.isHot" tone="gold">热</BaseTag>
        <span
          v-for="tag in props.article.tags"
          :key="tag"
          class="rounded bg-jj-bg-input px-1.5 py-0.5"
        >
          #{{ tag }}
        </span>
      </div>

      <h3
        class="mt-1.5 line-clamp-2 text-base font-medium text-jj-text-1 group-hover:text-jj-primary"
      >
        {{ props.article.title }}
      </h3>
      <p class="mt-1.5 line-clamp-2 text-sm text-jj-text-3">{{ props.article.brief }}</p>

      <div class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-jj-text-3">
        <span class="flex items-center gap-1">
          <BaseAvatar :src="props.article.author.avatar" :size="20" />
          <span class="text-jj-text-2">{{ props.article.author.nickname }}</span>
        </span>
        <span class="flex items-center gap-1">
          <Icon name="i-lucide:eye" class="size-3.5" />
          {{ formatCount(props.article.viewCount) }}
        </span>
        <span class="flex items-center gap-1">
          <Icon name="i-lucide:thumbs-up" class="size-3.5" />
          {{ formatCount(props.article.likeCount) }}
        </span>
        <span class="flex items-center gap-1">
          <Icon name="i-lucide:message-square" class="size-3.5" />
          {{ formatCount(props.article.commentCount) }}
        </span>
        <span class="ml-auto">{{ formatRelativeTime(props.article.createdAt) }}</span>
      </div>
    </div>

    <img
      v-if="props.article.cover"
      :src="props.article.cover"
      :alt="props.article.title"
      class="h-18 w-28 shrink-0 rounded object-cover"
      loading="lazy"
    >
  </NuxtLink>
</template>
