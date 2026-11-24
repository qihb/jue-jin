<script setup lang="ts">
import { FOLLOW_CATEGORY_ID } from '~~/shared/constants'

const { category, setCategory } = useFeedCategory()
const { articles, status, hasMore, loadingMore, loadMore, refresh } =
  await useArticleFeed(category)
const { isLoggedIn } = useAuth()

/** 「关注」流未登录时展示登录门 */
const isFollowFeed = computed(() => category.value === FOLLOW_CATEGORY_ID)

/** 登录成功后重新拉取关注的作者动态 */
watch(isLoggedIn, async (loggedIn) => {
  if (!loggedIn || !isFollowFeed.value) return
  await refresh()
})

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
      <div v-if="isFollowFeed && !isLoggedIn" class="py-4">
        <CommonLoginGate icon="i-lucide:user-plus" description="登录后即可查看关注的作者动态" />
      </div>

      <template v-else>
        <ArticleList :articles="articles" :status="status" />
        <div class="px-4">
          <CommonLoadMore :has-more="hasMore" :loading="loadingMore" @load="loadMore" />
        </div>
      </template>
    </section>
  </div>
</template>
