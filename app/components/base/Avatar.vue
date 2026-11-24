<script setup lang="ts">
interface Props {
  src?: string
  alt?: string
  /** 边长（px） */
  size?: number
  /** 是否圆形，false 为圆角方形 */
  round?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  src: '',
  alt: '',
  size: 40,
  round: true,
})

const boxStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
}))
</script>

<template>
  <span
    class="inline-flex shrink-0 items-center justify-center overflow-hidden bg-jj-bg-input text-jj-text-3"
    :class="round ? 'rounded-full' : 'rounded'"
    :style="boxStyle"
  >
    <img v-if="src" :src="src" :alt="alt" class="size-full object-cover" >
    <Icon v-else name="i-lucide:user" class="size-1/2" />
  </span>
</template>
