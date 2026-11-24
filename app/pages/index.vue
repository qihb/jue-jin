<script setup lang="ts">
const { category, setCategory } = useFeedCategory()
const { articles, status, hasMore, loadingMore, loadMore } = await useArticleFeed(category)

usePageSeo({
  title: '掘金 - 一个帮助开发者成长的社区',
  description:
    '掘金复刻 · 首页内容流，覆盖前端、后端、Android、iOS、人工智能、开发工具等领域的技术文章。',
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <section class="rounded-jj-card bg-jj-bg-card px-4 shadow-jj-card">
      <ArticleCategoryTabs :model-value="category" @update:model-value="setCategory" />
    </section>

    <section class="rounded-jj-card bg-jj-bg-card pb-4 shadow-jj-card">
      <ArticleList :articles="articles" :status="status" />
      <div class="px-4">
        <CommonLoadMore :has-more="hasMore" :loading="loadingMore" @load="loadMore" />
      </div>
    </section>
  </div>
</template>
