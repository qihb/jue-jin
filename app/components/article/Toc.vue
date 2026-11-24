<script setup lang="ts">
import type { ArticleTocItem } from '~/utils/markdown'

const props = defineProps<{ items: ArticleTocItem[] }>()

/** 吸顶头部高度 + 余量，用于判定当前高亮标题 */
const ACTIVE_OFFSET = 88

const activeId = ref('')

function updateActive() {
  if (!props.items.length) return
  let current = props.items[0]?.id ?? ''
  for (const item of props.items) {
    const el = document.getElementById(item.id)
    if (!el) continue
    if (el.getBoundingClientRect().top - ACTIVE_OFFSET <= 0) current = item.id
    else break
  }
  activeId.value = current
}

useEventListener(() => (import.meta.client ? window : undefined), 'scroll', updateActive, {
  passive: true,
})
onMounted(() => updateActive())
watch(
  () => props.items,
  () => updateActive(),
)
</script>

<template>
  <nav v-if="props.items.length" class="rounded-jj-card bg-jj-bg-card p-4 shadow-jj-card">
    <h2 class="text-sm font-medium text-jj-text-1">目录</h2>
    <ul class="mt-2 flex flex-col">
      <li v-for="item in props.items" :key="item.id">
        <a
          :href="`#${item.id}`"
          class="block truncate border-l-2 py-1 text-sm transition-colors"
          :class="[
            item.level >= 3 ? 'pl-6' : 'pl-3',
            item.id === activeId
              ? 'border-jj-primary font-medium text-jj-primary'
              : 'border-transparent text-jj-text-2 hover:text-jj-primary',
          ]"
        >
          {{ item.text }}
        </a>
      </li>
    </ul>
  </nav>
</template>
