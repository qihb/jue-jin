<script setup lang="ts">
import type { ArticleSummary } from '~~/shared/types'
import { getCategoryName } from '~~/shared/constants'

interface Props {
  articles: ArticleSummary[]
  status?: 'idle' | 'pending' | 'success' | 'error'
  skeletonCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  status: 'success',
  skeletonCount: 4,
})

const showSkeleton = computed(() => props.status === 'pending' && props.articles.length === 0)
const showEmpty = computed(() => props.status !== 'pending' && props.articles.length === 0)
</script>

<template>
  <div>
    <div v-if="showSkeleton" class="flex flex-col gap-4 p-4">
      <div v-for="row in props.skeletonCount" :key="row">
        <BaseSkeleton :height="16" width="60%" />
        <BaseSkeleton class="mt-2" :height="12" width="40%" />
      </div>
    </div>

    <BaseEmpty v-else-if="showEmpty" description="还没有发布过文章" />

    <ul v-else class="divide-y divide-jj-border">
      <li
        v-for="article in props.articles"
        :key="article.id"
        class="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-jj-bg-hover"
      >
        <NuxtLink :to="`/article/${article.id}`" target="_blank" class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium text-jj-text-1">{{ article.title }}</p>
          <p class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-jj-text-3">
            <span>{{ formatDateTime(article.createdAt) }}</span>
            <span class="flex items-center gap-1">
              <Icon name="i-lucide:eye" class="size-3.5" />
              {{ formatCount(article.viewCount) }}
            </span>
            <span class="flex items-center gap-1">
              <Icon name="i-lucide:thumbs-up" class="size-3.5" />
              {{ formatCount(article.likeCount) }}
            </span>
            <span class="flex items-center gap-1">
              <Icon name="i-lucide:message-square" class="size-3.5" />
              {{ formatCount(article.commentCount) }}
            </span>
          </p>
        </NuxtLink>
        <BaseTag v-if="getCategoryName(article.categoryId)">
          {{ getCategoryName(article.categoryId) }}
        </BaseTag>
      </li>
    </ul>
  </div>
</template>
