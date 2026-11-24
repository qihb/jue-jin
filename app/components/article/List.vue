<script setup lang="ts">
import type { ArticleSummary } from '~~/shared/types'

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
    <div v-if="showSkeleton" class="flex flex-col gap-6 p-4">
      <div v-for="row in props.skeletonCount" :key="row" class="flex gap-4">
        <div class="min-w-0 flex-1">
          <BaseSkeleton :height="20" width="70%" />
          <BaseSkeleton class="mt-3" :height="14" />
          <BaseSkeleton class="mt-2" :height="14" width="50%" />
        </div>
        <BaseSkeleton :width="112" :height="72" />
      </div>
    </div>

    <BaseEmpty v-else-if="showEmpty" description="该类目下暂无文章，换个分类看看" />

    <ul v-else class="divide-y divide-jj-border">
      <li v-for="article in props.articles" :key="article.id">
        <ArticleCard :article="article" />
      </li>
    </ul>
  </div>
</template>
