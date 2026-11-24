<script setup lang="ts">
import type { NotificationItem } from '~~/shared/types'

interface Props {
  items: NotificationItem[]
  status?: 'idle' | 'pending' | 'success' | 'error'
  skeletonCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  status: 'success',
  skeletonCount: 4,
})

const showSkeleton = computed(() => props.status === 'pending' && props.items.length === 0)
const showEmpty = computed(() => props.status !== 'pending' && props.items.length === 0)

/** 消息目标链接：系统消息指向当前分类列表，不做外部跳转 */
function linkOf(item: NotificationItem) {
  if (item.targetType === 'article') return `/article/${item.targetId}`
  if (item.targetType === 'pin') return '/pins'
  return { path: '/notification', query: { tab: item.tab } }
}
</script>

<template>
  <div>
    <div v-if="showSkeleton" class="flex flex-col gap-5 p-4">
      <div v-for="row in props.skeletonCount" :key="row" class="flex gap-3">
        <BaseSkeleton :width="36" :height="36" />
        <div class="min-w-0 flex-1">
          <BaseSkeleton :height="14" width="60%" />
          <BaseSkeleton class="mt-2" :height="12" width="35%" />
        </div>
      </div>
    </div>

    <BaseEmpty v-else-if="showEmpty" icon="i-lucide:bell-off" description="暂无消息" />

    <ul v-else class="divide-y divide-jj-border">
      <li v-for="item in props.items" :key="item.id">
        <NuxtLink
          :to="linkOf(item)"
          class="flex gap-3 px-4 py-3 transition-colors hover:bg-jj-bg-hover"
        >
          <BaseAvatar v-if="item.actor" :src="item.actor.avatar" :size="36" />
          <span
            v-else
            class="grid size-9 shrink-0 place-items-center rounded-full bg-jj-primary-light text-jj-primary"
          >
            <Icon name="i-lucide:bell" class="size-4" />
          </span>

          <div class="min-w-0 flex-1">
            <p class="text-sm text-jj-text-1">
              <span v-if="item.actor" class="font-medium">{{ item.actor.nickname }}</span>
              {{ item.title }}
            </p>
            <p v-if="item.content" class="mt-1 line-clamp-2 text-sm text-jj-text-3">
              {{ item.content }}
            </p>
            <p class="mt-1 text-xs text-jj-text-3">{{ formatRelativeTime(item.createdAt) }}</p>
          </div>

          <span
            v-if="!item.read"
            class="mt-2 size-2 shrink-0 rounded-full bg-jj-danger"
            title="未读"
          />
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
