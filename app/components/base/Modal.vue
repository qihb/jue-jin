<script setup lang="ts">
interface Props {
  title?: string
  /** 弹窗最大宽度（px） */
  width?: number
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  width: 480,
})

const visible = defineModel<boolean>({ required: true })

const emit = defineEmits<{ close: [] }>()

function close() {
  visible.value = false
  emit('close')
}

useEventListener(
  () => (import.meta.client ? window : undefined),
  'keydown',
  (event: KeyboardEvent) => {
    if (event.key === 'Escape' && visible.value) close()
  },
)

const bodyRef = shallowRef<HTMLElement | null>(null)
const isLocked = useScrollLock(bodyRef)

onMounted(() => {
  bodyRef.value = document.body
})

watch(visible, (value) => {
  isLocked.value = value
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-jj-bg-mask p-4 pt-24"
      @click.self="close"
    >
      <div
        class="w-full rounded-lg bg-jj-bg-card shadow-lg"
        :style="{ maxWidth: `${props.width}px` }"
      >
        <header
          v-if="props.title || $slots.header"
          class="flex items-center justify-between border-b border-jj-border px-5 py-3"
        >
          <slot name="header">
            <h3 class="text-base font-medium text-jj-text-1">{{ props.title }}</h3>
          </slot>
          <button
            type="button"
            class="cursor-pointer text-jj-text-3 transition-colors hover:text-jj-text-1"
            @click="close"
          >
            <Icon name="i-lucide:x" class="size-5" />
          </button>
        </header>

        <div class="px-5 py-4">
          <slot />
        </div>

        <footer
          v-if="$slots.footer"
          class="flex justify-end gap-2 border-t border-jj-border px-5 py-3"
        >
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>
