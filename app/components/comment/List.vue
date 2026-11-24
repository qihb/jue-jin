<script setup lang="ts">
import type { Comment } from '~~/shared/types'

interface Props {
  comments: Comment[]
  loading?: boolean
  hasMore?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  hasMore: false,
})

const emit = defineEmits<{ load: [] }>()
</script>

<template>
  <div>
    <h2 class="text-base font-medium text-jj-text-1">评论 {{ props.comments.length }}</h2>

    <BaseEmpty
      v-if="!props.comments.length"
      class="mt-2"
      icon="i-lucide:message-square"
      description="还没有评论，快来抢沙发"
    />

    <ul v-else class="mt-4 flex flex-col gap-5">
      <li v-for="comment in props.comments" :key="comment.id">
        <CommentItem :comment="comment" />
      </li>
    </ul>

    <CommonLoadMore
      v-if="props.comments.length"
      class="mt-4"
      :has-more="props.hasMore"
      :loading="props.loading"
      @load="emit('load')"
    />
  </div>
</template>
