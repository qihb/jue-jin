<script setup lang="ts">
export interface TabItem {
  label: string
  value: string
  /** 右侧角标数字（如未读数），未传或 <= 0 时不展示 */
  badge?: number
}

const props = defineProps<{ items: TabItem[] }>()

const model = defineModel<string>({ required: true })
</script>

<template>
  <div class="flex items-center gap-6 overflow-x-auto border-b border-jj-border">
    <button
      v-for="item in props.items"
      :key="item.value"
      type="button"
      class="relative shrink-0 cursor-pointer py-3 text-sm whitespace-nowrap transition-colors"
      :class="
        model === item.value ? 'font-medium text-jj-text-1' : 'text-jj-text-3 hover:text-jj-primary'
      "
      @click="model = item.value"
    >
      {{ item.label }}
      <span
        v-if="item.value !== model && item.badge"
        class="ml-1 rounded-full bg-jj-danger px-1.5 text-xs leading-4 text-white"
      >
        {{ item.badge > 99 ? '99+' : item.badge }}
      </span>
      <span
        v-if="model === item.value"
        class="absolute inset-x-0 -bottom-px h-0.5 rounded bg-jj-primary"
      />
    </button>
  </div>
</template>
