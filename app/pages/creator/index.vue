<script setup lang="ts">
const { overview, status, articles, hasMore, loadingMore, loadMore } = await useCreator()

const tab = ref('overview')

const TABS = [
  { label: '数据概览', value: 'overview' },
  { label: '内容管理', value: 'content' },
  { label: '草稿列表', value: 'drafts' },
]

usePageSeo({
  title: '创作者中心 - 掘金',
  description: '掘金创作中心 · 数据概览、内容管理与草稿列表。',
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <section class="rounded-jj-card bg-jj-bg-card px-4 shadow-jj-card">
      <BaseTabs v-model="tab" :items="TABS" />
    </section>

    <template v-if="tab === 'overview'">
      <div
        v-if="status === 'pending' && !overview"
        class="rounded-jj-card bg-jj-bg-card p-4 shadow-jj-card"
      >
        <BaseSkeleton :height="72" />
      </div>
      <CreatorOverview v-else-if="overview" :overview="overview" />
    </template>

    <section
      v-else-if="tab === 'content'"
      class="rounded-jj-card bg-jj-bg-card pb-4 shadow-jj-card"
    >
      <CreatorContentList :articles="articles" :status="status" />
      <div class="px-4">
        <CommonLoadMore :has-more="hasMore" :loading="loadingMore" @load="loadMore" />
      </div>
    </section>

    <section v-else class="rounded-jj-card bg-jj-bg-card p-4 shadow-jj-card">
      <EditorDraftList />
    </section>
  </div>
</template>
