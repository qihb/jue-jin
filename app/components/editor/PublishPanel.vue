<script setup lang="ts">
import type { Category } from '~~/shared/types'

interface Props {
  /** 可选内容分类（不含推荐 / 关注） */
  categories: readonly Category[]
}

const props = defineProps<Props>()

const categoryId = defineModel<string>('categoryId', { required: true })
const cover = defineModel<string>('cover', { required: true })
const brief = defineModel<string>('brief', { required: true })
const tags = defineModel<string[]>('tags', { required: true })

/** 最多可选标签数 */
const MAX_TAGS = 5

const tagInput = ref('')

function addTag() {
  const value = tagInput.value.trim().replace(/^#/, '')
  tagInput.value = ''
  if (!value) return
  if (tags.value.includes(value) || tags.value.length >= MAX_TAGS) return
  tags.value = [...tags.value, value]
}

function removeTag(tag: string) {
  tags.value = tags.value.filter((item) => item !== tag)
}
</script>

<template>
  <div class="flex flex-col gap-4 text-sm">
    <div>
      <p class="mb-2 text-jj-text-2">选择分类</p>
      <div class="flex flex-wrap gap-2">
        <BaseButton
          v-for="category in props.categories"
          :key="category.id"
          :variant="categoryId === category.id ? 'primary' : 'secondary'"
          size="sm"
          @click="categoryId = category.id"
        >
          {{ category.name }}
        </BaseButton>
      </div>
    </div>

    <div>
      <p class="mb-2 text-jj-text-2">添加标签（最多 {{ MAX_TAGS }} 个）</p>
      <div class="flex flex-wrap items-center gap-2">
        <BaseTag v-for="tag in tags" :key="tag" closable @close="removeTag(tag)">
          #{{ tag }}
        </BaseTag>
        <input
          v-if="tags.length < MAX_TAGS"
          v-model="tagInput"
          type="text"
          placeholder="输入标签后回车"
          class="h-7 w-36 rounded bg-jj-bg-input px-2 text-xs text-jj-text-1 outline-none placeholder:text-jj-text-3 focus:ring-1 focus:ring-jj-primary"
          @keydown.enter.prevent="addTag"
        >
      </div>
    </div>

    <div>
      <p class="mb-2 text-jj-text-2">封面图地址（选填）</p>
      <input
        v-model="cover"
        type="url"
        placeholder="https://…"
        class="h-8 w-full rounded bg-jj-bg-input px-3 text-xs text-jj-text-1 outline-none placeholder:text-jj-text-3 focus:ring-1 focus:ring-jj-primary"
      >
      <img v-if="cover" :src="cover" alt="封面预览" class="mt-2 h-28 w-full rounded object-cover">
    </div>

    <div>
      <p class="mb-2 text-jj-text-2">摘要（选填，留空由正文自动生成）</p>
      <textarea
        v-model="brief"
        rows="3"
        placeholder="用一两句话概括文章内容…"
        class="w-full resize-none rounded bg-jj-bg-input px-3 py-2 text-xs text-jj-text-1 outline-none placeholder:text-jj-text-3 focus:ring-1 focus:ring-jj-primary"
      />
    </div>
  </div>
</template>
