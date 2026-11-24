<script setup lang="ts">
const { books, status, hasMore, loadingMore, loadMore } = await useBookList()

usePageSeo({
  title: '小册 - 掘金',
  description: '掘金小册 · 体系化的技术专栏，跟随作者系统学习一门技术。',
})
</script>

<template>
  <section class="rounded-jj-card bg-jj-bg-card pb-4 shadow-jj-card">
    <div class="border-b border-jj-border px-4 py-3">
      <h1 class="text-base font-medium text-jj-text-1">小册</h1>
    </div>

    <div v-if="status === 'pending' && books.length === 0" class="flex flex-col gap-4 p-4">
      <BaseSkeleton v-for="row in 4" :key="row" :height="96" />
    </div>

    <BaseEmpty v-else-if="books.length === 0" icon="i-lucide:book-open" description="暂无小册" />

    <ul v-else class="divide-y divide-jj-border">
      <li v-for="book in books" :key="book.id">
        <BookCard :book="book" />
      </li>
    </ul>

    <div class="px-4">
      <CommonLoadMore :has-more="hasMore" :loading="loadingMore" @load="loadMore" />
    </div>
  </section>
</template>
