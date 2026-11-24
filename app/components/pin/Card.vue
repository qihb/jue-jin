<script setup lang="ts">
import type { PinDetail } from '~~/shared/types'

const props = defineProps<{ pin: PinDetail }>()
</script>

<template>
  <NuxtLink
    :to="`/pin/${props.pin.id}`"
    class="group block px-4 py-4 transition-colors hover:bg-jj-bg-hover"
  >
    <div class="flex items-center gap-2 text-xs text-jj-text-3">
      <BaseAvatar :src="props.pin.author.avatar" :size="24" />
      <span class="text-jj-text-2">{{ props.pin.author.nickname }}</span>
      <span>{{ formatRelativeTime(props.pin.createdAt) }}</span>
    </div>

    <p
      class="mt-2 line-clamp-3 text-sm whitespace-pre-line text-jj-text-1 group-hover:text-jj-primary"
    >
      {{ props.pin.content }}
    </p>

    <div v-if="props.pin.images.length" class="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
      <img
        v-for="(image, index) in props.pin.images"
        :key="index"
        :src="image"
        :alt="`${props.pin.author.nickname} 的沸点配图`"
        class="aspect-[4/3] w-full rounded object-cover"
        loading="lazy"
      >
    </div>

    <div class="mt-3 flex flex-wrap items-center gap-2 text-xs text-jj-text-3">
      <span
        v-for="topic in props.pin.topics"
        :key="topic"
        class="rounded bg-jj-bg-input px-1.5 py-0.5"
      >
        #{{ topic }}
      </span>
      <span class="ml-auto flex items-center gap-3">
        <span class="flex items-center gap-1">
          <Icon name="i-lucide:thumbs-up" class="size-3.5" />
          {{ formatCount(props.pin.likeCount) }}
        </span>
        <span class="flex items-center gap-1">
          <Icon name="i-lucide:message-square" class="size-3.5" />
          {{ formatCount(props.pin.commentCount) }}
        </span>
      </span>
    </div>
  </NuxtLink>
</template>
