<script setup lang="ts">
import type { PinDetail } from '~~/shared/types'

interface Props {
  pins: PinDetail[]
  status?: 'idle' | 'pending' | 'success' | 'error'
  skeletonCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  status: 'success',
  skeletonCount: 3,
})

const showSkeleton = computed(() => props.status === 'pending' && props.pins.length === 0)
const showEmpty = computed(() => props.status !== 'pending' && props.pins.length === 0)
</script>

<template>
  <div>
    <div v-if="showSkeleton" class="flex flex-col gap-6 p-4">
      <div v-for="row in props.skeletonCount" :key="row">
        <div class="flex items-center gap-2">
          <BaseSkeleton :width="24" :height="24" round />
          <BaseSkeleton :width="120" :height="14" />
        </div>
        <BaseSkeleton class="mt-3" :height="14" />
        <BaseSkeleton class="mt-2" :height="14" width="70%" />
      </div>
    </div>

    <BaseEmpty
      v-else-if="showEmpty"
      icon="i-lucide:message-square"
      description="还没有沸点，去发一条吧"
    />

    <ul v-else class="divide-y divide-jj-border">
      <li v-for="pin in props.pins" :key="pin.id">
        <PinCard :pin="pin" />
      </li>
    </ul>
  </div>
</template>
