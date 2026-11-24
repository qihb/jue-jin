<script setup lang="ts">
const RANK_TABS = [
  { label: '作者榜', value: 'author' },
  { label: '文章榜', value: 'article' },
]

const activeTab = ref('author')

const { authors, articles, status } = await useRank()

usePageSeo({
  title: '排行榜 - 掘金',
  description: '掘金排行榜 · 作者掘力榜与热门文章榜，发现社区里的优质创作者与内容。',
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <section class="rounded-jj-card bg-jj-bg-card px-4 shadow-jj-card">
      <BaseTabs v-model="activeTab" :items="RANK_TABS" />
    </section>

    <section class="rounded-jj-card bg-jj-bg-card py-2 shadow-jj-card">
      <div v-if="status === 'pending'" class="flex flex-col gap-3 p-4">
        <BaseSkeleton v-for="row in 5" :key="row" :height="40" />
      </div>
      <RankAuthorList v-else-if="activeTab === 'author'" :authors="authors" />
      <RankArticleList v-else :articles="articles" />
    </section>
  </div>
</template>
