<script setup lang="ts">
import type { EditorInitialValue } from '~/composables/useEditor'

definePageMeta({ layout: 'editor' })

const route = useRoute()
const id = computed(() => String(route.params.id))

const { mounted, getDraft } = useDraft()

/** 草稿存在本地（localStorage），SSR 无法读取，故就绪后才组装初始值 */
const initial = computed<EditorInitialValue | null>(() => {
  if (!mounted.value) return null
  const draft = getDraft(id.value)
  if (!draft) return null
  return {
    title: draft.title,
    content: draft.content,
    brief: draft.brief,
    cover: draft.cover,
    categoryId: draft.categoryId,
    tags: draft.tags,
    draftId: draft.id,
  }
})

usePageSeo({
  title: '编辑草稿 - 掘金',
  description: '掘金创作中心 · 继续编辑本地草稿。',
})
</script>

<template>
  <ClientOnly>
    <EditorForm v-if="initial" :key="initial.draftId" :initial="initial" />
    <BaseEmpty v-else-if="mounted" description="草稿不存在或已被删除">
      <BaseButton class="mt-2" variant="secondary" @click="navigateTo('/editor/drafts')">
        返回草稿箱
      </BaseButton>
    </BaseEmpty>
    <BaseSkeleton v-else :height="480" />
  </ClientOnly>
</template>
