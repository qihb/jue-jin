<script setup lang="ts">
import { SEARCH_TYPES } from '~~/shared/constants'

const { keyword, type, results, status, hasMore, loadingMore, loadMore, setType } =
  await useSearch()

const tabs = SEARCH_TYPES.map((item) => ({ label: item.name, value: item.id }))

usePageSeo({
  title: () => (keyword.value ? `${keyword.value} - 搜索结果 - 掘金` : '搜索 - 掘金'),
  description: '掘金搜索 · 一站式检索文章、用户、标签与小册。',
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <section class="rounded-jj-card bg-jj-bg-card px-4 shadow-jj-card">
      <BaseTabs :items="tabs" :model-value="type" @update:model-value="setType" />
    </section>

    <section class="rounded-jj-card bg-jj-bg-card pb-4 shadow-jj-card">
      <BaseEmpty
        v-if="!keyword"
        icon="i-lucide:search"
        description="输入关键字，搜索文章 / 用户 / 标签 / 小册"
      />
      <template v-else>
        <SearchResultList :items="results" :status="status" />
        <div class="px-4">
          <CommonLoadMore :has-more="hasMore" :loading="loadingMore" @load="loadMore" />
        </div>
      </template>
    </section>
  </div>
</template>
