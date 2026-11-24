<script setup lang="ts">
// 编辑器布局：精简顶栏 + 全屏无侧栏，给编辑区留出最大空间
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <header class="sticky top-0 z-40 border-b border-jj-border bg-jj-bg-card">
      <div class="flex h-12 items-center gap-4 px-4">
        <NuxtLink to="/" class="flex shrink-0 items-center gap-2">
          <span
            class="grid size-7 place-items-center rounded bg-jj-primary text-base font-bold text-white"
          >
            掘
          </span>
          <span class="text-base font-semibold text-jj-text-1">掘金</span>
        </NuxtLink>
        <span class="text-sm text-jj-text-2">创作中心</span>
        <NuxtLink to="/" class="ml-auto text-sm text-jj-text-2 hover:text-jj-primary">
          返回首页
        </NuxtLink>
      </div>
    </header>

    <main class="mx-auto w-full max-w-[1200px] flex-1 px-4 py-4">
      <slot />
    </main>

    <CommonToast />
  </div>
</template>
