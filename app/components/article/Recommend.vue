<script setup lang="ts">
import type { ArticleSummary } from '~~/shared/types'

const props = defineProps<{ articles: ArticleSummary[] }>()
</script>

<template>
  <section v-if="props.articles.length" class="rounded-jj-card bg-jj-bg-card px-4 py-3 shadow-jj-card">
    <h2 class="text-sm font-medium text-jj-text-1">相关推荐</h2>
    <ul class="mt-1 divide-y divide-jj-border">
      <li v-for="item in props.articles" :key="item.id">
        <NuxtLink :to="`/article/${item.id}`" class="group flex gap-3 py-3">
          <div class="min-w-0 flex-1">
            <h3 class="line-clamp-2 text-sm text-jj-text-1 group-hover:text-jj-primary">
              {{ item.title }}
            </h3>
            <p class="mt-1.5 flex items-center gap-3 text-xs text-jj-text-3">
              <span class="truncate">{{ item.author.nickname }}</span>
              <span class="flex shrink-0 items-center gap-1">
                <Icon name="i-lucide:thumbs-up" class="size-3" />
                {{ formatCount(item.likeCount) }}
              </span>
            </p>
          </div>
          <img
            v-if="item.cover"
            :src="item.cover"
            :alt="item.title"
            class="h-14 w-20 shrink-0 rounded object-cover"
            loading="lazy"
          >
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>
