<script setup lang="ts">
type ActionKey = 'like' | 'collect' | 'comment' | 'share'

interface Props {
  /** 当前登录用户是否已点赞 */
  liked: boolean
  /** 当前登录用户是否已收藏 */
  collected: boolean
  likeCount: number
  collectCount: number
  commentCount: number
  /** 非空时在操作条右侧展示提示文案（如「链接已复制」） */
  tips?: string
}

const props = withDefaults(defineProps<Props>(), { tips: '' })

const emit = defineEmits<{ like: []; collect: []; comment: []; share: [] }>()

function handleAction(key: ActionKey) {
  switch (key) {
    case 'like':
      emit('like')
      break
    case 'collect':
      emit('collect')
      break
    case 'comment':
      emit('comment')
      break
    case 'share':
      emit('share')
      break
  }
}

interface ActionItem {
  key: ActionKey
  icon: string
  label: string
  count?: number
  active: boolean
}

const items = computed<ActionItem[]>(() => [
  {
    key: 'like',
    icon: 'i-lucide:thumbs-up',
    label: '点赞',
    count: props.likeCount,
    active: props.liked,
  },
  {
    key: 'comment',
    icon: 'i-lucide:message-square',
    label: '评论',
    count: props.commentCount,
    active: false,
  },
  {
    key: 'collect',
    icon: 'i-lucide:star',
    label: '收藏',
    count: props.collectCount,
    active: props.collected,
  },
  { key: 'share', icon: 'i-lucide:share-2', label: '分享', active: false },
])
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <button
      v-for="item in items"
      :key="item.key"
      type="button"
      class="flex cursor-pointer items-center gap-1.5 rounded border px-3 py-1.5 text-sm transition-colors"
      :class="
        item.active
          ? 'border-jj-primary bg-jj-primary-light text-jj-primary'
          : 'border-jj-border text-jj-text-2 hover:border-jj-primary hover:text-jj-primary'
      "
      @click="handleAction(item.key)"
    >
      <Icon :name="item.icon" class="size-4" />
      <span>{{ item.label }}</span>
      <span v-if="item.count !== undefined">{{ formatCount(item.count) }}</span>
    </button>
    <span v-if="props.tips" class="ml-2 text-xs text-jj-success">{{ props.tips }}</span>
  </div>
</template>
