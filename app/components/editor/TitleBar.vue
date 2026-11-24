<script setup lang="ts">
interface Props {
  /** 标题最大长度 */
  titleMax: number
  /** 正文字数（不含空白） */
  wordCount: number
  /** 最近一次自动保存时间（ISO），为空表示尚未保存 */
  savedAt: string
  canPublish: boolean
  publishing?: boolean
}

const props = withDefaults(defineProps<Props>(), { publishing: false })

const title = defineModel<string>({ required: true })

const emit = defineEmits<{ publish: []; save: []; openDrafts: [] }>()

/** 「HH:mm」保存时间（本地时区，仅客户端展示） */
const savedTip = computed(() => {
  if (!props.savedAt) return '内容将自动保存到本地'
  const date = new Date(props.savedAt)
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `已保存 ${hour}:${minute}`
})
</script>

<template>
  <div
    class="flex flex-wrap items-center gap-3 rounded-jj-card bg-jj-bg-card px-4 py-3 shadow-jj-card"
  >
    <input
      v-model="title"
      type="text"
      :maxlength="props.titleMax"
      placeholder="输入文章标题…"
      class="h-9 min-w-40 flex-1 bg-transparent text-lg font-medium text-jj-text-1 outline-none placeholder:text-jj-text-3"
    >
    <span class="shrink-0 text-xs text-jj-text-3">
      {{ title.length }}/{{ props.titleMax }} · {{ props.wordCount }} 字
    </span>

    <div class="flex shrink-0 items-center gap-2">
      <BaseButton variant="text" size="sm" @click="emit('openDrafts')">
        <Icon name="i-lucide:folder-open" class="size-4" />
        草稿箱
      </BaseButton>
      <BaseButton variant="secondary" size="sm" @click="emit('save')">存草稿</BaseButton>
      <BaseButton
        size="sm"
        :disabled="!props.canPublish"
        :loading="props.publishing"
        @click="emit('publish')"
      >
        发布
      </BaseButton>
    </div>

    <p class="w-full text-xs text-jj-text-3">{{ savedTip }}</p>
  </div>
</template>
