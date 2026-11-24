<script setup lang="ts">
const model = defineModel<string>({ default: 'square' })

interface CircleItem {
  id: string
  name: string
  icon: string
}

/** 沸点圈子（广场 + 我的圈子 + 各领域圈子） */
const CIRCLES: readonly CircleItem[] = [
  { id: 'square', name: '沸点广场', icon: 'i-lucide:message-circle' },
  { id: 'mine', name: '我的圈子', icon: 'i-lucide:users' },
  { id: 'finance', name: '理财交流圈', icon: 'i-lucide:trending-up' },
  { id: 'daily', name: '打工人的日常', icon: 'i-lucide:briefcase' },
  { id: 'code-life', name: '代码人生', icon: 'i-lucide:code-2' },
  { id: 'job', name: '内推招聘广场', icon: 'i-lucide:send' },
  { id: 'tech', name: '技术交流圈', icon: 'i-lucide:cpu' },
  { id: 'fish', name: '上班摸鱼', icon: 'i-lucide:fish' },
  { id: 'more', name: '更多', icon: 'i-lucide:more-horizontal' },
]
</script>

<template>
  <nav class="flex flex-col rounded-jj-card bg-jj-bg-card shadow-jj-card">
    <div class="flex items-center gap-2 border-b border-jj-border px-4 py-3">
      <Icon name="i-lucide:medal" class="size-4 text-jj-primary" />
      <span class="text-sm font-medium text-jj-text-1">社区排行榜</span>
    </div>
    <ul class="flex flex-col py-1">
      <li v-for="item in CIRCLES" :key="item.id">
        <button
          type="button"
          class="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-jj-bg-hover"
          :class="model === item.id ? 'bg-jj-bg-hover font-medium text-jj-primary' : 'text-jj-text-2'"
          @click="model = item.id"
        >
          <Icon :name="item.icon" class="size-4" />
          <span>{{ item.name }}</span>
        </button>
      </li>
    </ul>
  </nav>
</template>
