<script setup lang="ts">
import type { CollectionSummary } from '~~/shared/types'

const props = defineProps<{ collection: CollectionSummary }>()
</script>

<template>
  <NuxtLink
    :to="`/collection/${props.collection.id}`"
    class="group flex h-full gap-3 rounded-jj-card bg-jj-bg-card p-3 ring-1 ring-jj-border transition-colors hover:bg-jj-bg-hover"
  >
    <img
      v-if="props.collection.cover"
      :src="props.collection.cover"
      :alt="props.collection.name"
      class="h-20 w-28 shrink-0 rounded object-cover"
      loading="lazy"
    >

    <div class="flex min-w-0 flex-1 flex-col">
      <h3 class="line-clamp-1 text-sm font-medium text-jj-text-1 group-hover:text-jj-primary">
        {{ props.collection.name }}
      </h3>
      <p class="mt-1 line-clamp-2 text-xs text-jj-text-3">{{ props.collection.description }}</p>
      <p class="mt-auto flex items-center gap-2 pt-2 text-xs text-jj-text-3">
        <span class="flex items-center gap-1">
          <Icon name="i-lucide:file-text" class="size-3.5" />
          {{ props.collection.articleCount }} 篇
        </span>
        <span>{{ formatRelativeTime(props.collection.updatedAt) }}更新</span>
      </p>
    </div>
  </NuxtLink>
</template>
