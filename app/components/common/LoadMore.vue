<script setup lang="ts">
interface Props {
  hasMore: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{ load: [] }>()

const sentinel = ref<HTMLElement | null>(null)

/** 滚动到哨兵元素附近时自动触发加载；`canLoadMore` 兜底避免重复请求 */
useInfiniteScroll(sentinel, () => emit('load'), {
  distance: 200,
  canLoadMore: () => props.hasMore && !props.loading,
})
</script>

<template>
  <div ref="sentinel" class="flex justify-center py-2">
    <span v-if="props.loading" class="flex items-center gap-2 text-xs text-jj-text-3">
      <Icon name="i-lucide:loader-circle" class="size-4 animate-spin" />
      加载中…
    </span>
    <BaseButton v-else-if="props.hasMore" variant="secondary" size="sm" @click="emit('load')">
      加载更多
    </BaseButton>
    <span v-else class="text-xs text-jj-text-3">— 已经到底啦 —</span>
  </div>
</template>
