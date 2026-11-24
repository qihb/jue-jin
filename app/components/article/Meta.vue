<script setup lang="ts">
import type { ArticleDetail } from '~~/shared/types'
import { getCategoryName } from '~~/shared/constants'

const props = defineProps<{ article: ArticleDetail }>()

const categoryName = computed(() => getCategoryName(props.article.categoryId))
</script>

<template>
  <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-jj-text-3">
    <span>{{ formatRelativeTime(props.article.createdAt) }}</span>
    <span class="flex items-center gap-1">
      <Icon name="i-lucide:eye" class="size-3.5" />
      {{ formatCount(props.article.viewCount) }} 阅读
    </span>
    <span v-if="categoryName" class="flex items-center gap-1">
      <Icon name="i-lucide:folder" class="size-3.5" />
      {{ categoryName }}
    </span>
    <span v-for="tag in props.article.tags" :key="tag">#{{ tag }}</span>
  </div>
</template>
