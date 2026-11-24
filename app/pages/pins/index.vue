<script setup lang="ts">
const { pins, status, hasMore, loadingMore, loadMore } = await usePinFeed()
const { user, isLoggedIn } = useAuth()

usePageSeo({
  title: '沸点 - 掘金',
  description: '掘金沸点 · 开发者们的日常分享、吐槽与讨论，短内容社区流。',
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <section class="flex items-center gap-3 rounded-jj-card bg-jj-bg-card p-4 shadow-jj-card">
      <BaseAvatar v-if="isLoggedIn" :src="user?.avatar" :size="36" />
      <NuxtLink
        to="/pins/publish"
        class="flex h-10 flex-1 items-center rounded bg-jj-bg-input px-4 text-sm text-jj-text-3 transition-colors hover:text-jj-primary"
      >
        分享此刻的想法…
      </NuxtLink>
      <BaseButton size="md" @click="navigateTo('/pins/publish')">
        <Icon name="i-lucide:pen-line" class="size-4" />
        发沸点
      </BaseButton>
    </section>

    <section class="rounded-jj-card bg-jj-bg-card pb-4 shadow-jj-card">
      <PinList :pins="pins" :status="status" />
      <div class="px-4">
        <CommonLoadMore :has-more="hasMore" :loading="loadingMore" @load="loadMore" />
      </div>
    </section>
  </div>
</template>
