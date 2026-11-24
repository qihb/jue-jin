<script setup lang="ts">
import type { CreatorOverview } from '~~/shared/types'

interface Props {
  overview: CreatorOverview
}

const props = defineProps<Props>()

const stats = computed(() => [
  { key: 'view', label: '阅读量', value: props.overview.totalView, trend: props.overview.trends.view },
  { key: 'like', label: '点赞数', value: props.overview.totalLike, trend: props.overview.trends.like },
  {
    key: 'collect',
    label: '收藏数',
    value: props.overview.totalCollect,
    trend: props.overview.trends.collect,
  },
  {
    key: 'comment',
    label: '评论数',
    value: props.overview.totalComment,
    trend: props.overview.trends.comment,
  },
])

/** 近 7 日阅读量柱状图：按最大值归一化高度 */
const seriesMax = computed(() => Math.max(1, ...props.overview.viewSeries.map((p) => p.value)))
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <div
        v-for="stat in stats"
        :key="stat.key"
        class="rounded-jj-card bg-jj-bg-card p-4 shadow-jj-card"
      >
        <p class="text-xs text-jj-text-3">{{ stat.label }}</p>
        <p class="mt-1 text-xl font-semibold text-jj-text-1">{{ formatCount(stat.value) }}</p>
        <p class="mt-1 text-xs" :class="stat.trend >= 0 ? 'text-jj-success' : 'text-jj-danger'">
          {{ stat.trend >= 0 ? '↑' : '↓' }} {{ Math.abs(stat.trend) }}% 较昨日
        </p>
      </div>
    </div>

    <div class="rounded-jj-card bg-jj-bg-card p-4 shadow-jj-card">
      <p class="text-sm font-medium text-jj-text-1">近 7 日阅读量</p>
      <div class="mt-4 flex h-40 items-end gap-3">
        <div
          v-for="point in props.overview.viewSeries"
          :key="point.date"
          class="flex flex-1 flex-col items-center gap-1"
        >
          <span class="text-xs text-jj-text-3">{{ formatCount(point.value) }}</span>
          <div
            class="w-full rounded-t bg-jj-primary/70"
            :style="{ height: `${Math.max(4, (point.value / seriesMax) * 100)}%` }"
          />
          <span class="text-xs text-jj-text-3">{{ point.date }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
