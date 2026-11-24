<script setup lang="ts">
const route = useRoute()
const tagName = computed(() => String(route.params.tag))

const { tag, articles, status, hasMore, loadingMore, loadMore } = await useTagDetail(tagName)

const notFound = computed(
  () => status.value === 'error' || (!tag.value && status.value !== 'pending'),
)

usePageSeo({
  title: () => (tag.value ? `${tag.value.name} - 标签 - 掘金` : '标签 - 掘金'),
  description: () => tag.value?.description || '掘金标签页 · 探索同一技术方向下的优质文章。',
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <div v-if="notFound" class="rounded-jj-card bg-jj-bg-card py-12 shadow-jj-card">
      <BaseEmpty icon="i-lucide:hash" description="标签不存在或已被删除">
        <BaseButton class="mt-2" variant="secondary" @click="navigateTo('/')">返回首页</BaseButton>
      </BaseEmpty>
    </div>

    <template v-else>
      <section class="rounded-jj-card bg-jj-bg-card p-4 shadow-jj-card">
        <div v-if="tag" class="flex items-start gap-4">
          <span
            class="grid size-12 shrink-0 place-items-center rounded bg-jj-bg-input text-jj-primary"
          >
            <Icon :name="tag.icon || 'i-lucide:hash'" class="size-6" />
          </span>
          <div class="min-w-0 flex-1">
            <h1 class="text-lg font-semibold text-jj-text-1">#{{ tag.name }}</h1>
            <p class="mt-1 text-sm text-jj-text-3">{{ tag.description }}</p>
            <p class="mt-2 text-xs text-jj-text-3">
              {{ formatCount(tag.articleCount) }} 篇文章 ·
              {{ formatCount(tag.followerCount) }} 人关注
            </p>
          </div>
          <BaseButton variant="secondary" size="sm">关注</BaseButton>
        </div>
        <BaseSkeleton v-else :height="48" />
      </section>

      <section class="rounded-jj-card bg-jj-bg-card pb-4 shadow-jj-card">
        <ArticleList :articles="articles" :status="status" />
        <div class="px-4">
          <CommonLoadMore :has-more="hasMore" :loading="loadingMore" @load="loadMore" />
        </div>
      </section>
    </template>
  </div>
</template>
