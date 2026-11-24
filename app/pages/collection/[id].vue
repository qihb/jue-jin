<script setup lang="ts">
const route = useRoute()
const id = computed(() => String(route.params.id))

const { isLoggedIn } = useAuth()
const { collection, articles, status, hasMore, loadingMore, loadMore, refresh } =
  await useCollectionDetail(id)

const notFound = computed(
  () => isLoggedIn.value && !collection.value && status.value !== 'pending',
)

/** 登录成功后重新拉取收藏集详情（含头部一键登录） */
watch(isLoggedIn, async (loggedIn) => {
  if (!loggedIn) return
  await refresh()
})

useSeoMeta({
  title: () => (collection.value ? `${collection.value.name} - 收藏集 - 掘金` : '收藏集 - 掘金'),
  description: () => collection.value?.description ?? '掘金收藏集详情',
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <section class="rounded-jj-card bg-jj-bg-card shadow-jj-card">
      <div v-if="!isLoggedIn" class="py-4">
        <CommonLoginGate icon="i-lucide:folder-lock" description="登录后即可查看收藏集" />
      </div>

      <BaseEmpty v-else-if="notFound" icon="i-lucide:folder-x" description="收藏集不存在">
        <BaseButton class="mt-2" variant="secondary" @click="navigateTo('/collection')">
          返回收藏集
        </BaseButton>
      </BaseEmpty>

      <div v-else-if="!collection" class="p-4">
        <BaseSkeleton :height="96" />
      </div>

      <div v-else class="flex flex-col gap-4 p-4 sm:flex-row">
        <img
          v-if="collection.cover"
          :src="collection.cover"
          :alt="collection.name"
          class="h-28 w-44 shrink-0 rounded object-cover"
        >

        <div class="min-w-0 flex-1">
          <h1 class="text-lg font-semibold text-jj-text-1">{{ collection.name }}</h1>
          <p class="mt-2 text-sm leading-6 text-jj-text-2">{{ collection.description }}</p>
          <p class="mt-3 text-xs text-jj-text-3">
            {{ collection.articleCount }} 篇文章 · {{ formatRelativeTime(collection.updatedAt) }}更新
          </p>
        </div>
      </div>
    </section>

    <section v-if="isLoggedIn && collection" class="rounded-jj-card bg-jj-bg-card pb-4 shadow-jj-card">
      <ArticleList :articles="articles" :status="status" />
      <div class="px-4">
        <CommonLoadMore :has-more="hasMore" :loading="loadingMore" @load="loadMore" />
      </div>
    </section>
  </div>
</template>
