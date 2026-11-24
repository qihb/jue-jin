<script setup lang="ts">
import { SORT_FOLLOW } from '~~/shared/constants'

const route = useRoute()
const router = useRouter()

const sort = computed(() => {
  const value = route.query.sort
  return typeof value === 'string' && value ? value : 'recommend'
})

function setSort(value: string) {
  void router.replace({
    query: { ...route.query, sort: value === 'recommend' ? undefined : value },
  })
}

const { pins, status, hasMore, loadingMore, loadMore, refresh } = await usePinFeed(sort)
const { isLoggedIn } = useAuth()

/** 「关注」流未登录时展示登录门 */
const isFollowFeed = computed(() => sort.value === SORT_FOLLOW)

/** 登录成功后重新拉取关注的作者沸点 */
watch(isLoggedIn, async (loggedIn) => {
  if (!loggedIn || !isFollowFeed.value) return
  await refresh()
})

usePageSeo({
  title: '沸点 - 掘金',
  description: '掘金沸点 · 开发者们的日常分享、吐槽与讨论，短内容社区流。',
})
</script>

<template>
  <div class="flex gap-4">
    <!-- 左侧圈子导航 -->
    <div class="hidden w-44 shrink-0 lg:block">
      <PinCirclesNav />
    </div>

    <!-- 中间内容区：排序 tabs + 发布框 + 沸点流 -->
    <div class="min-w-0 flex-1 flex flex-col gap-4">
      <section class="rounded-jj-card bg-jj-bg-card px-4 shadow-jj-card">
        <ArticleCategoryTabs :model-value="sort" @update:model-value="setSort" />
      </section>

      <section class="rounded-jj-card bg-jj-bg-card p-4 shadow-jj-card">
        <NuxtLink to="/pins/publish" class="block">
          <div
            class="rounded bg-jj-bg-input px-4 py-3 text-sm text-jj-text-3 transition-colors hover:text-jj-primary"
          >
            快和掘友一起分享新鲜事！告诉你个小秘密，发布沸点时添加圈子和话题会被更多掘友看到哦～
          </div>
        </NuxtLink>
        <div class="mt-3 flex items-center justify-between">
          <div class="flex items-center gap-3 text-jj-text-3">
            <button
              type="button"
              class="flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors hover:bg-jj-bg-hover hover:text-jj-primary"
            >
              <Icon name="i-lucide:smile" class="size-4" />
              表情
            </button>
            <button
              type="button"
              class="flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors hover:bg-jj-bg-hover hover:text-jj-primary"
            >
              <Icon name="i-lucide:image" class="size-4" />
              图片
            </button>
            <button
              type="button"
              class="flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors hover:bg-jj-bg-hover hover:text-jj-primary"
            >
              <Icon name="i-lucide:link" class="size-4" />
              链接
            </button>
            <button
              type="button"
              class="flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors hover:bg-jj-bg-hover hover:text-jj-primary"
            >
              <Icon name="i-lucide:hash" class="size-4" />
              话题
            </button>
          </div>
          <BaseButton size="sm" @click="navigateTo('/pins/publish')">
            发布
          </BaseButton>
        </div>
      </section>

      <section class="rounded-jj-card bg-jj-bg-card pb-4 shadow-jj-card">
        <div v-if="isFollowFeed && !isLoggedIn" class="py-4">
          <CommonLoginGate icon="i-lucide:user-plus" description="登录后即可查看关注的作者动态" />
        </div>

        <template v-else>
          <PinList :pins="pins" :status="status" />
          <div class="px-4">
            <CommonLoadMore :has-more="hasMore" :loading="loadingMore" @load="loadMore" />
          </div>
        </template>
      </section>
    </div>
  </div>
</template>
