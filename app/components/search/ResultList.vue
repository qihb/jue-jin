<script setup lang="ts">
import type { SearchItem } from '~~/shared/types'

interface Props {
  items: SearchItem[]
  status?: 'idle' | 'pending' | 'success' | 'error'
}

const props = withDefaults(defineProps<Props>(), {
  status: 'success',
})

const showSkeleton = computed(() => props.status === 'pending' && props.items.length === 0)
const showEmpty = computed(() => props.status !== 'pending' && props.items.length === 0)

/** 列表 key：不同类型用各自的领域 id 拼接 */
function itemKey(item: SearchItem): string {
  if (item.type === 'article') return `article-${item.article.id}`
  if (item.type === 'user') return `user-${item.user.id}`
  if (item.type === 'tag') return `tag-${item.tag.id}`
  return `book-${item.book.id}`
}
</script>

<template>
  <div>
    <div v-if="showSkeleton" class="flex flex-col gap-4 p-4">
      <BaseSkeleton v-for="row in 4" :key="row" :height="72" />
    </div>

    <BaseEmpty
      v-else-if="showEmpty"
      icon="i-lucide:search-x"
      description="没有找到相关内容，换个关键字试试"
    />

    <ul v-else class="divide-y divide-jj-border">
      <li v-for="item in props.items" :key="itemKey(item)">
        <ArticleCard v-if="item.type === 'article'" :article="item.article" />

        <div v-else-if="item.type === 'user'" class="flex items-center gap-3 px-4 py-4">
          <BaseAvatar :src="item.user.avatar" :size="40" />
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-jj-text-1">{{ item.user.nickname }}</p>
            <p class="truncate text-xs text-jj-text-3">
              {{ item.user.description || '@' + item.user.username }}
            </p>
          </div>
          <BaseButton variant="secondary" size="sm">关注</BaseButton>
        </div>

        <NuxtLink
          v-else-if="item.type === 'tag'"
          :to="`/tag/${item.tag.name}`"
          class="flex items-center gap-3 px-4 py-4 transition-colors hover:bg-jj-bg-hover"
        >
          <span
            class="grid size-10 shrink-0 place-items-center rounded bg-jj-bg-input text-jj-primary"
          >
            <Icon :name="item.tag.icon || 'i-lucide:hash'" class="size-5" />
          </span>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-jj-text-1">#{{ item.tag.name }}</p>
            <p class="truncate text-xs text-jj-text-3">{{ item.tag.description }}</p>
          </div>
          <span class="shrink-0 text-xs text-jj-text-3">
            {{ formatCount(item.tag.articleCount) }} 篇文章
          </span>
        </NuxtLink>

        <BookCard v-else :book="item.book" />
      </li>
    </ul>
  </div>
</template>
