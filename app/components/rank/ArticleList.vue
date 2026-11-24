<script setup lang="ts">
import type { ArticleSummary } from '~~/shared/types'

defineProps<{ articles: ArticleSummary[] }>()
</script>

<template>
  <ul class="divide-y divide-jj-border">
    <li v-for="(article, index) in articles" :key="article.id">
      <NuxtLink
        :to="`/article/${article.id}`"
        target="_blank"
        class="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-jj-bg-hover"
      >
        <span
          class="w-6 shrink-0 text-center text-sm font-semibold"
          :class="index < 3 ? 'text-jj-gold' : 'text-jj-text-3'"
        >
          {{ index + 1 }}
        </span>
        <div class="min-w-0 flex-1">
          <p class="line-clamp-2 text-sm font-medium text-jj-text-1">{{ article.title }}</p>
          <div class="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-jj-text-3">
            <span class="flex items-center gap-1">
              <BaseAvatar :src="article.author.avatar" :size="18" />
              {{ article.author.nickname }}
            </span>
            <span class="flex items-center gap-1">
              <Icon name="i-lucide:eye" class="size-3.5" />
              {{ formatCount(article.viewCount) }}
            </span>
            <span class="flex items-center gap-1">
              <Icon name="i-lucide:thumbs-up" class="size-3.5" />
              {{ formatCount(article.likeCount) }}
            </span>
          </div>
        </div>
      </NuxtLink>
    </li>
  </ul>
</template>
