<script setup lang="ts">
definePageMeta({ layout: 'editor' })

usePageSeo({
  title: '写文章 - 掘金',
  description: '掘金创作中心 · Markdown 文章编辑器，支持实时预览与本地草稿自动保存。',
})
</script>

<template>
  <EditorForm />
</template>
