<script setup lang="ts">
import type { UserBrief } from '~~/shared/types'

interface Props {
  users: UserBrief[]
  status?: 'idle' | 'pending' | 'success' | 'error'
  hasMore: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  status: 'success',
  loading: false,
})

const emit = defineEmits<{ load: [] }>()

const showSkeleton = computed(() => props.status === 'pending' && props.users.length === 0)
const showEmpty = computed(() => props.status !== 'pending' && props.users.length === 0)
</script>

<template>
  <div>
    <div v-if="showSkeleton" class="flex flex-col gap-4 p-4">
      <BaseSkeleton v-for="row in 3" :key="row" :height="56" />
    </div>

    <BaseEmpty
      v-else-if="showEmpty"
      icon="i-lucide:users"
      description="还没有关注任何人"
    />

    <ul v-else class="divide-y divide-jj-border">
      <li v-for="user in props.users" :key="user.id">
        <NuxtLink
          :to="`/user/${user.id}`"
          class="flex items-center gap-3 px-4 py-4 transition-colors hover:bg-jj-bg-hover"
        >
          <BaseAvatar :src="user.avatar" :size="40" />
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-jj-text-1">{{ user.nickname }}</p>
            <p class="truncate text-xs text-jj-text-3">
              {{ user.description || '@' + user.username }}
            </p>
          </div>
        </NuxtLink>
      </li>
    </ul>

    <div v-if="!showEmpty" class="px-4">
      <CommonLoadMore :has-more="props.hasMore" :loading="props.loading" @load="emit('load')" />
    </div>
  </div>
</template>
