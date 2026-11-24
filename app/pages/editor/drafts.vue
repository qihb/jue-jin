<script setup lang="ts">
definePageMeta({ layout: 'editor' })

useSeoMeta({
  title: '草稿箱 - 掘金',
  description: '掘金创作中心 · 本地草稿列表，支持继续编辑与删除。',
})
</script>

<template>
  <section class="rounded-jj-card bg-jj-bg-card p-4 shadow-jj-card">
    <header class="mb-3 flex items-center justify-between">
      <h1 class="text-base font-medium text-jj-text-1">草稿箱</h1>
      <BaseButton size="sm" @click="navigateTo('/editor')">写新文章</BaseButton>
    </header>

    <EditorDraftList />
  </section>
</template>
