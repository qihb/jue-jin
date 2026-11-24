<script setup lang="ts">
/** 占位话题：阶段 8 接入真实标签数据后替换 */
const HOT_TOPICS = ['前端', 'Vue', 'React', 'TypeScript', 'Node.js', 'AI'] as const
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

    <!-- 作者榜（阶段 3 接真实数据） -->
    <section class="rounded-jj-card bg-jj-bg-card p-4 shadow-jj-card">
      <h2 class="text-sm font-medium text-jj-text-1">作者榜</h2>
      <ul class="mt-3 flex flex-col gap-3">
        <li v-for="index in 3" :key="index" class="flex items-center gap-2">
          <BaseSkeleton :width="32" :height="32" round />
          <BaseSkeleton :width="120" :height="12" />
        </li>
      </ul>
    </section>

    <!-- 热门话题 -->
    <section class="rounded-jj-card bg-jj-bg-card p-4 shadow-jj-card">
      <h2 class="text-sm font-medium text-jj-text-1">热门话题</h2>
      <div class="mt-3 flex flex-wrap gap-2">
        <BaseTag v-for="topic in HOT_TOPICS" :key="topic" tone="default">#{{ topic }}</BaseTag>
      </div>
    </section>

    <!-- App 下载 -->
    <section class="rounded-jj-card bg-jj-bg-card p-4 shadow-jj-card">
      <h2 class="text-sm font-medium text-jj-text-1">下载掘金 App</h2>
      <p class="mt-1 text-xs text-jj-text-3">扫码下载，随时获取技术干货</p>
      <div
        class="mt-3 grid h-24 place-items-center rounded border border-dashed border-jj-border text-xs text-jj-text-3"
      >
        二维码占位
      </div>
    </section>
  </aside>
</template>
