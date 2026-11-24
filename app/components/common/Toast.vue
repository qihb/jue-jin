<script setup lang="ts">
const { toasts, dismissToast } = useToast()
</script>

<template>
  <Teleport to="body">
    <div
      class="pointer-events-none fixed top-4 left-1/2 z-[60] flex w-full max-w-[92vw] -translate-x-1/2 flex-col items-center gap-2 sm:max-w-md"
    >
      <TransitionGroup
        enter-active-class="transition duration-200"
        leave-active-class="transition duration-200"
        enter-from-class="-translate-y-2 opacity-0"
        leave-to-class="-translate-y-2 opacity-0"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          role="alert"
          class="pointer-events-auto flex w-full items-center gap-2 rounded-jj-card border border-jj-border bg-jj-bg-card px-4 py-2.5 text-sm shadow-lg"
        >
          <Icon
            :name="toast.type === 'error' ? 'i-lucide:circle-alert' : 'i-lucide:circle-check'"
            class="size-4 shrink-0"
            :class="toast.type === 'error' ? 'text-jj-danger' : 'text-jj-success'"
          />
          <span class="min-w-0 flex-1 break-words text-jj-text-1">{{ toast.message }}</span>
          <button
            type="button"
            class="cursor-pointer text-jj-text-3 transition-colors hover:text-jj-text-1"
            title="关闭"
            @click="dismissToast(toast.id)"
          >
            <Icon name="i-lucide:x" class="size-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
