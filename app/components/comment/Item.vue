<script setup lang="ts">
import type { Comment } from '~~/shared/types'

const props = defineProps<{ comment: Comment }>()
</script>

<template>
  <div class="flex gap-3">
    <BaseAvatar :src="props.comment.author.avatar" :size="36" />
    <div class="min-w-0 flex-1">
      <div class="flex flex-wrap items-center gap-2 text-sm">
        <span class="text-jj-text-2">{{ props.comment.author.nickname }}</span>
        <span v-if="props.comment.replyToName" class="text-xs text-jj-text-3">
          回复 {{ props.comment.replyToName }}
        </span>
      </div>

      <p class="mt-1 text-sm leading-6 whitespace-pre-wrap text-jj-text-1">
        {{ props.comment.content }}
      </p>

      <div class="mt-1.5 flex items-center gap-4 text-xs text-jj-text-3">
        <span>{{ formatRelativeTime(props.comment.createdAt) }}</span>
        <span class="flex cursor-pointer items-center gap-1 hover:text-jj-primary">
          <Icon name="i-lucide:thumbs-up" class="size-3.5" />
          {{ props.comment.likeCount }}
        </span>
        <span class="cursor-pointer hover:text-jj-primary">回复</span>
      </div>

      <ul
        v-if="props.comment.children.length"
        class="mt-3 flex flex-col gap-3 border-l-2 border-jj-border pl-3"
      >
        <li v-for="child in props.comment.children" :key="child.id">
          <CommentItem :comment="child" />
        </li>
      </ul>
    </div>
  </div>
</template>
