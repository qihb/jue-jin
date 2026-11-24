<script setup lang="ts">
const { drafts, mounted, removeDraft } = useDraft()

/** 正文字数（不含空白） */
function wordCount(content: string): number {
  return content.replace(/\s/g, '').length
}
</script>

<template>
  <ClientOnly>
    <BaseSkeleton v-if="!mounted" :height="120" />
    <BaseEmpty v-else-if="drafts.length === 0" description="还没有草稿，去写一篇吧" />
    <ul v-else class="divide-y divide-jj-border">
      <li v-for="draft in drafts" :key="draft.id" class="flex items-center gap-4 py-3">
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium text-jj-text-1">
            {{ draft.title || '未命名草稿' }}
          </p>
          <p class="mt-1 truncate text-xs text-jj-text-3">
            {{ formatDateTime(draft.updatedAt) }} · {{ wordCount(draft.content) }} 字
          </p>
        </div>
        <BaseButton size="sm" variant="secondary" @click="navigateTo(`/editor/draft/${draft.id}`)">
          继续编辑
        </BaseButton>
        <BaseButton size="sm" variant="text" @click="removeDraft(draft.id)">删除</BaseButton>
      </li>
    </ul>
  </ClientOnly>
</template>
