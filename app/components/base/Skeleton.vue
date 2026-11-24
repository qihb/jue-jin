<script setup lang="ts">
interface Props {
  /** 宽度：数字按 px，字符串原样输出 */
  width?: number | string
  /** 高度：数字按 px，字符串原样输出 */
  height?: number | string
  round?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: 16,
  round: false,
})

function toSize(value: number | string) {
  return typeof value === 'number' ? `${value}px` : value
}

const boxStyle = computed(() => ({
  width: toSize(props.width),
  height: toSize(props.height),
}))
</script>

<template>
  <div
    class="animate-pulse bg-jj-bg-input"
    :class="props.round ? 'rounded-full' : 'rounded'"
    :style="boxStyle"
  />
</template>
