<script setup lang="ts">
interface Props {
  description?: string
  /** Iconify 图标名 */
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  description: '暂无数据',
  icon: 'i-lucide:inbox',
})
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-3 py-12 text-jj-text-3">
    <Icon :name="props.icon" class="size-12 opacity-60" />
    <p class="text-sm">{{ props.description }}</p>
    <slot />
  </div>
</template>
