<script setup lang="ts">
interface Props {
  placeholder?: string
  submitting?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '写下你的评论…',
  submitting: false,
})

const content = defineModel<string>({ default: '' })

const emit = defineEmits<{ submit: [] }>()

const canSubmit = computed(() => content.value.trim().length > 0 && !props.submitting)

function handleSubmit() {
  if (!canSubmit.value) return
  emit('submit')
}
</script>

<template>
  <div class="rounded border border-jj-border bg-jj-bg-card p-3">
    <textarea
      v-model="content"
      :placeholder="props.placeholder"
      rows="3"
      class="w-full resize-none bg-transparent text-sm text-jj-text-1 outline-none placeholder:text-jj-text-3"
    />
    <div class="mt-2 flex items-center justify-between">
      <span class="text-xs text-jj-text-3">{{ content.length }} 字</span>
      <BaseButton size="sm" :loading="props.submitting" :disabled="!canSubmit" @click="handleSubmit">
        发布
      </BaseButton>
    </div>
  </div>
</template>
