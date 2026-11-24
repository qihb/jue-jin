<script setup lang="ts">
const { authors, hotTags } = await useHomeSidebar()

/** 友情链接：对应页面后续阶段补齐，暂作占位展示 */
const FRIEND_LINKS = ['用户协议', '隐私政策', '帮助中心', '关于我们'] as const
</script>

<template>
  <aside class="flex w-64 shrink-0 flex-col gap-4 max-lg:hidden">
    <!-- 签到卡片 -->
    <section class="rounded-jj-card bg-jj-bg-card p-4 shadow-jj-card">
      <h2 class="text-sm font-medium text-jj-text-1">上午好，掘友！</h2>
      <p class="mt-1 text-xs text-jj-text-3">登录后即可签到，领取矿石奖励</p>
      <div class="mt-3 flex items-center gap-2">
        <BaseButton size="sm">立即登录</BaseButton>
        <BaseButton variant="secondary" size="sm">注册</BaseButton>
      </div>
    </section>

    <!-- 作者榜 -->
    <section class="rounded-jj-card bg-jj-bg-card p-4 shadow-jj-card">
      <h2 class="text-sm font-medium text-jj-text-1">作者榜</h2>
      <ul class="mt-3 flex flex-col gap-3">
        <li v-for="item in authors" :key="item.user.id" class="flex items-center gap-2">
          <span class="w-4 shrink-0 text-center text-xs text-jj-text-3">{{ item.rank }}</span>
          <BaseAvatar :src="item.user.avatar" :size="32" />
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm text-jj-text-1">{{ item.user.nickname }}</p>
            <p class="truncate text-xs text-jj-text-3">{{ item.user.description }}</p>
          </div>
        </li>
      </ul>
    </section>

    <!-- 热门话题 -->
    <section class="rounded-jj-card bg-jj-bg-card p-4 shadow-jj-card">
      <h2 class="text-sm font-medium text-jj-text-1">热门话题</h2>
      <div class="mt-3 flex flex-wrap gap-2">
        <BaseTag v-for="tag in hotTags" :key="tag.id" tone="default">#{{ tag.name }}</BaseTag>
      </div>
    </section>

    <!-- 友情链接 -->
    <section class="rounded-jj-card bg-jj-bg-card p-4 shadow-jj-card">
      <h2 class="text-sm font-medium text-jj-text-1">友情链接</h2>
      <ul class="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-jj-text-3">
        <li v-for="link in FRIEND_LINKS" :key="link">{{ link }}</li>
      </ul>
    </section>
  </aside>
</template>
