<script setup lang="ts">
type ButtonVariant = 'primary' | 'secondary' | 'text' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface Props {
  /** 视觉风格 */
  variant?: ButtonVariant
  /** 尺寸 */
  size?: ButtonSize
  /** 是否占满父容器宽度 */
  block?: boolean
  disabled?: boolean
  loading?: boolean
  /** 原生 button type */
  nativeType?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  block: false,
  disabled: false,
  loading: false,
  nativeType: 'button',
})

const emit = defineEmits<{ click: [event: MouseEvent] }>()

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'bg-jj-primary text-white hover:bg-jj-primary-hover',
  secondary: 'bg-jj-primary-light text-jj-primary hover:bg-jj-primary hover:text-white',
  text: 'bg-transparent text-jj-text-2 hover:text-jj-primary',
  danger: 'bg-jj-danger text-white hover:opacity-90',
}

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'h-7 px-3 text-xs',
  md: 'h-8 px-4 text-sm',
  lg: 'h-10 px-5 text-base',
}

const isDisabled = computed(() => props.disabled || props.loading)

function handleClick(event: MouseEvent) {
  if (isDisabled.value) return
  emit('click', event)
}
</script>

<template>
  <button
    :type="nativeType"
    :disabled="isDisabled"
    class="inline-flex cursor-pointer items-center justify-center gap-1 rounded font-medium transition-colors select-none disabled:cursor-not-allowed disabled:opacity-60"
    :class="[VARIANT_CLASS[variant], SIZE_CLASS[size], block && 'w-full']"
    @click="handleClick"
  >
    <Icon v-if="loading" name="i-lucide:loader-circle" class="size-4 animate-spin" />
    <slot />
  </button>
</template>
