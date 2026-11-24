<script setup lang="ts">
const { isLoggedIn } = useAuth()
const { collections, status, hasMore, loadingMore, loadMore, refresh } = await useCollectionList()

/** 登录成功后重新拉取收藏集（含头部一键登录） */
watch(isLoggedIn, async (loggedIn) => {
  if (!loggedIn) return
  await refresh()
})

useSeoMeta({
  title: '我的收藏集 - 掘金',
  description: '掘金收藏集 · 按主题归类的文章合集，随时回顾。',
})
</script>

<template>
  <section class="rounded-jj-card bg-jj-bg-card shadow-jj-card">
    <div class="border-b border-jj-border px-4 py-3">
      <h1 class="text-base font-medium text-jj-text-1">我的收藏集</h1>
    </div>

    <div v-if="!isLoggedIn" class="py-4">
      <CommonLoginGate icon="i-lucide:folder-lock" description="登录后即可查看收藏集" />
    </div>

    <template v-else>
      <div
        v-if="status === 'pending' && collections.length === 0"
        class="grid gap-4 p-4 sm:grid-cols-2"
      >
        <BaseSkeleton v-for="row in 4" :key="row" :height="104" />
      </div>

      <BaseEmpty
        v-else-if="collections.length === 0"
        icon="i-lucide:folder-open"
        description="还没有收藏集"
      />

      <ul v-else class="grid gap-4 p-4 sm:grid-cols-2">
        <li v-for="item in collections" :key="item.id">
          <CollectionCard :collection="item" />
        </li>
      </ul>

      <div class="px-4 pb-4">
        <CommonLoadMore :has-more="hasMore" :loading="loadingMore" @load="loadMore" />
      </div>
    </template>
  </section>
</template>
