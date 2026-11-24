<script setup lang="ts">
import type { PinPublishPayload } from '~~/shared/types'
import {
  PIN_CONTENT_MAX_LENGTH,
  PIN_IMAGE_MAX_COUNT,
  PIN_TOPIC_MAX_COUNT,
  PIN_TOPIC_SUGGESTIONS,
} from '~~/shared/constants'

const props = withDefaults(defineProps<{ loading?: boolean }>(), { loading: false })
const emit = defineEmits<{ submit: [payload: PinPublishPayload] }>()

const content = ref('')
/** 图片地址多行输入：每行一个 URL */
const imageText = ref('')
const topics = ref<string[]>([])
const topicInput = ref('')

/** 逐行解析图片地址，去空去重 */
const images = computed<string[]>(() =>
  Array.from(
    new Set(
      imageText.value
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line !== ''),
    ),
  ),
)

const contentLength = computed(() => content.value.length)
const imageOverflow = computed(() => images.value.length > PIN_IMAGE_MAX_COUNT)

function removeImage(url: string) {
  imageText.value = imageText.value
    .split('\n')
    .filter((line) => line.trim() !== url)
    .join('\n')
}

function toggleTopic(topic: string) {
  if (topics.value.includes(topic)) {
    topics.value = topics.value.filter((item) => item !== topic)
    return
  }
  if (topics.value.length >= PIN_TOPIC_MAX_COUNT) {
    pushToast(`话题最多 ${PIN_TOPIC_MAX_COUNT} 个`)
    return
  }
  topics.value = [...topics.value, topic]
}

function addTopic() {
  const topic = topicInput.value.trim().replace(/^#/, '')
  if (!topic) return
  if (!topics.value.includes(topic)) {
    if (topics.value.length >= PIN_TOPIC_MAX_COUNT) {
      pushToast(`话题最多 ${PIN_TOPIC_MAX_COUNT} 个`)
      return
    }
    topics.value = [...topics.value, topic]
  }
  topicInput.value = ''
}

function handleSubmit() {
  if (props.loading) return

  const value = content.value.trim()
  if (!value) {
    pushToast('请输入沸点内容')
    return
  }
  if (value.length > PIN_CONTENT_MAX_LENGTH) {
    pushToast(`沸点内容不能超过 ${PIN_CONTENT_MAX_LENGTH} 字`)
    return
  }
  if (images.value.length > PIN_IMAGE_MAX_COUNT) {
    pushToast(`配图最多 ${PIN_IMAGE_MAX_COUNT} 张`)
    return
  }
  if (topics.value.length > PIN_TOPIC_MAX_COUNT) {
    pushToast(`话题最多 ${PIN_TOPIC_MAX_COUNT} 个`)
    return
  }

  emit('submit', { content: value, images: images.value, topics: topics.value })
}
</script>

<template>
  <form class="flex flex-col gap-6" @submit.prevent="handleSubmit">
    <label class="flex flex-col gap-1.5">
      <span class="flex items-center justify-between">
        <span class="text-sm text-jj-text-2">正文</span>
        <span
          class="text-xs"
          :class="contentLength > PIN_CONTENT_MAX_LENGTH ? 'text-jj-danger' : 'text-jj-text-3'"
        >
          {{ contentLength }} / {{ PIN_CONTENT_MAX_LENGTH }}
        </span>
      </span>
      <textarea
        v-model="content"
        rows="6"
        :maxlength="PIN_CONTENT_MAX_LENGTH"
        placeholder="分享你的开发日常、技术心得或想法…"
        class="w-full resize-y rounded bg-jj-bg-input px-3 py-2 text-sm leading-relaxed text-jj-text-1 outline-none placeholder:text-jj-text-3 focus:ring-1 focus:ring-jj-primary"
      />
    </label>

    <div class="flex flex-col gap-1.5">
      <span class="flex items-center justify-between">
        <span class="text-sm text-jj-text-2">配图</span>
        <span class="text-xs" :class="imageOverflow ? 'text-jj-danger' : 'text-jj-text-3'">
          {{ images.length }} / {{ PIN_IMAGE_MAX_COUNT }}
        </span>
      </span>
      <textarea
        v-model="imageText"
        rows="3"
        placeholder="粘贴图片地址，每行一个"
        class="w-full resize-y rounded bg-jj-bg-input px-3 py-2 text-sm text-jj-text-1 outline-none placeholder:text-jj-text-3 focus:ring-1 focus:ring-jj-primary"
      />

      <div v-if="images.length" class="mt-1 grid grid-cols-3 gap-2 sm:grid-cols-4">
        <div v-for="url in images" :key="url" class="group relative">
          <img
            :src="url"
            alt="沸点配图预览"
            class="aspect-[4/3] w-full rounded object-cover"
            loading="lazy"
          >
          <button
            type="button"
            class="absolute top-1 right-1 grid size-6 cursor-pointer place-items-center rounded-full bg-jj-bg-mask text-white opacity-0 transition-opacity group-hover:opacity-100"
            title="删除这张图片"
            @click="removeImage(url)"
          >
            <Icon name="i-lucide:x" class="size-3.5" />
          </button>
        </div>
      </div>
      <p v-if="imageOverflow" class="text-xs text-jj-danger">
        配图最多 {{ PIN_IMAGE_MAX_COUNT }} 张，请删除多余的行
      </p>
    </div>

    <div class="flex flex-col gap-2">
      <span class="text-sm text-jj-text-2">话题</span>

      <div v-if="topics.length" class="flex flex-wrap gap-2">
        <span
          v-for="topic in topics"
          :key="topic"
          class="flex items-center gap-1 rounded bg-jj-primary-light px-2 py-0.5 text-xs text-jj-primary"
        >
          #{{ topic }}
          <button
            type="button"
            class="cursor-pointer text-jj-primary opacity-70 transition-opacity hover:opacity-100"
            title="移除话题"
            @click="toggleTopic(topic)"
          >
            <Icon name="i-lucide:x" class="size-3" />
          </button>
        </span>
      </div>

      <div class="flex flex-wrap gap-2">
        <button
          v-for="topic in PIN_TOPIC_SUGGESTIONS"
          :key="topic"
          type="button"
          class="cursor-pointer rounded px-2 py-0.5 text-xs transition-colors"
          :class="
            topics.includes(topic)
              ? 'bg-jj-primary text-white'
              : 'bg-jj-bg-input text-jj-text-2 hover:text-jj-primary'
          "
          @click="toggleTopic(topic)"
        >
          #{{ topic }}
        </button>
      </div>

      <div class="flex items-center gap-2">
        <input
          v-model="topicInput"
          type="text"
          placeholder="自定义话题，回车添加"
          class="h-9 flex-1 rounded bg-jj-bg-input px-3 text-sm text-jj-text-1 outline-none placeholder:text-jj-text-3 focus:ring-1 focus:ring-jj-primary"
          @keydown.enter.prevent="addTopic"
        >
        <BaseButton variant="secondary" size="sm" @click="addTopic">添加</BaseButton>
      </div>
    </div>

    <div class="flex justify-end gap-2 border-t border-jj-border pt-4">
      <BaseButton size="lg" native-type="submit" :loading="props.loading">发布</BaseButton>
    </div>
  </form>
</template>
