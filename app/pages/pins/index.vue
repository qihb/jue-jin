<script setup lang="ts">
const { pins, status, hasMore, loadingMore, loadMore } = await usePinFeed()

useSeoMeta({
  title: '沸点 - 掘金',
  description: '掘金沸点 · 开发者们的日常分享、吐槽与讨论，短内容社区流。',
})
</script>

<template>
  <section class="rounded-jj-card bg-jj-bg-card pb-4 shadow-jj-card">
    <PinList :pins="pins" :status="status" />
    <div class="px-4">
      <CommonLoadMore :has-more="hasMore" :loading="loadingMore" @load="loadMore" />
    </div>
  </section>
</template>
