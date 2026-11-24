<script setup lang="ts">
type TagTone = 'default' | 'primary' | 'gold' | 'success'

interface Props {
  tone?: TagTone
  closable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  tone: 'default',
  closable: false,
})

const emit = defineEmits<{ close: [] }>()

const TONE_CLASS: Record<TagTone, string> = {
  default: 'bg-jj-bg-input text-jj-text-2',
  primary: 'bg-jj-primary-light text-jj-primary',
  gold: 'bg-jj-gold/15 text-jj-gold',
  success: 'bg-jj-success/15 text-jj-success',
}
</script>

<template>
  <span
    class="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs leading-5"
    :class="TONE_CLASS[props.tone]"
  >
    <slot />
    <button
      v-if="closable"
      type="button"
      class="cursor-pointer text-current opacity-60 hover:opacity-100"
      @click="emit('close')"
    >
      <Icon name="i-lucide:x" class="size-3" />
    </button>
  </span>
</template>
