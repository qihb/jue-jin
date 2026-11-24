<script setup lang="ts">
import type { ArticleSummary } from '~~/shared/types'
import { getCategoryName } from '~~/shared/constants'

const props = defineProps<{ article: ArticleSummary }>()

const categoryName = computed(() => getCategoryName(props.article.categoryId))
</script>

<template>
  <NuxtLink
    :to="`/article/${props.article.id}`"
    target="_blank"
    class="group flex gap-4 px-4 py-4 transition-colors hover:bg-jj-bg-hover"
  >
    <div class="flex min-w-0 flex-1 flex-col">
      <!-- 第一行：标题 -->
      <h3 class="flex items-center gap-1.5 line-clamp-2 text-base font-medium text-jj-text-1 group-hover:text-jj-primary">
        <BaseTag v-if="props.article.isHot" tone="gold" class="shrink-0">热</BaseTag>
        <span class="min-w-0">{{ props.article.title }}</span>
      </h3>

      <!-- 第二行：内容概要 -->
      <p class="mt-1.5 line-clamp-2 text-sm text-jj-text-3">{{ props.article.brief }}</p>

      <!-- 第三行：作者 | 时间 | 查看 | 点赞 + 右侧标签 -->
      <div class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-jj-text-3">
        <span class="text-jj-text-2">{{ props.article.author.nickname }}</span>
        <span class="text-jj-border">|</span>
        <span>{{ formatRelativeTime(props.article.createdAt) }}</span>
        <span class="flex items-center gap-1">
          <Icon name="i-lucide:eye" class="size-3.5" />
          {{ formatCount(props.article.viewCount) }}
        </span>
        <span class="flex items-center gap-1">
          <Icon name="i-lucide:thumbs-up" class="size-3.5" />
          {{ formatCount(props.article.likeCount) }}
        </span>

        <!-- 右侧标签：分类名 + tags -->
        <div class="ml-auto flex flex-wrap items-center gap-1.5">
          <span v-if="categoryName" class="rounded bg-jj-bg-input px-1.5 py-0.5">
            {{ categoryName }}
          </span>
          <span
            v-for="tag in props.article.tags"
            :key="tag"
            class="rounded bg-jj-bg-input px-1.5 py-0.5"
          >
            {{ tag }}
          </span>
        </div>
      </div>
    </div>

    <!-- 右侧封面图：统一大小 -->
    <img
      v-if="props.article.cover"
      :src="props.article.cover"
      :alt="props.article.title"
      class="h-20 w-[120px] shrink-0 rounded object-cover"
      loading="lazy"
    >
  </NuxtLink>
</template>
