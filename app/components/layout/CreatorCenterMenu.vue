<script setup lang="ts">
/** 创作者快捷入口 */
const ACTIONS = [
  { label: '写文章', icon: 'i-lucide:file-text', to: '/editor/article', color: 'text-blue-500' },
  { label: '发沸点', icon: 'i-lucide:flame', to: '/pins/publish', color: 'text-green-500' },
  { label: '写笔记', icon: 'i-lucide:notebook-pen', to: '/editor/note', color: 'text-indigo-500' },
  { label: '写代码', icon: 'i-lucide:code-2', to: '/editor/code', color: 'text-purple-500' },
  { label: '草稿箱', icon: 'i-lucide:inbox', to: '/creator?tab=draft', color: 'text-cyan-500' },
] as const

/** 创作灵感话题（mock） */
const TOPICS = ['每天一个知识点', '日新计划', '每日精选文章'] as const

const visible = defineModel<boolean>({ default: false })

/** 点击外部关闭 */
const rootRef = ref<HTMLElement | null>(null)
onClickOutside(rootRef, () => {
  visible.value = false
})
</script>

<template>
  <div ref="rootRef" class="relative">
    <slot :open="visible" />

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="translate-y-1 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-1 opacity-0"
    >
      <div
        v-if="visible"
        class="absolute right-0 top-full z-50 mt-2 w-[420px] rounded-lg bg-jj-bg-card p-4 shadow-xl ring-1 ring-jj-border"
      >
        <!-- 快捷入口 -->
        <div class="grid grid-cols-5 gap-2">
          <NuxtLink
            v-for="action in ACTIONS"
            :key="action.label"
            :to="action.to"
            class="flex flex-col items-center gap-1.5 rounded-lg p-2 transition-colors hover:bg-jj-bg-hover"
            @click="visible = false"
          >
            <span
              class="grid size-10 place-items-center rounded-lg text-lg"
              :class="action.color"
            >
              <Icon :name="action.icon" class="size-6" />
            </span>
            <span class="text-xs text-jj-text-2">{{ action.label }}</span>
          </NuxtLink>
        </div>

        <div class="my-3 border-t border-jj-border" />

        <!-- 创作灵感 -->
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-jj-text-1">创作灵感</span>
          <button
            type="button"
            class="flex items-center gap-0.5 text-xs text-jj-text-3 transition-colors hover:text-jj-primary"
          >
            查看更多
            <Icon name="i-lucide:chevron-right" class="size-3" />
          </button>
        </div>

        <ul class="mt-2 space-y-1">
          <li v-for="topic in TOPICS" :key="topic">
            <NuxtLink
              :to="`/tag/${topic}`"
              class="flex items-center gap-2 rounded px-2 py-1.5 transition-colors hover:bg-jj-bg-hover"
              @click="visible = false"
            >
              <span class="rounded bg-jj-primary-light px-1.5 py-0.5 text-[10px] text-jj-primary">
                话题
              </span>
              <span class="text-sm text-jj-text-1">#{{ topic }}#</span>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>
