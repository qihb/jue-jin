<script setup lang="ts">
// 全站默认布局：顶部导航 +（内容区 + 右侧栏）+ 页脚
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <AppHeader />

    <div class="mx-auto flex w-full max-w-[1440px] flex-1 gap-4 px-4 py-4">
      <div class="min-w-0 flex-1">
        <slot />
      </div>
      <AppSidebar />
    </div>

    <AppFooter />

    <CommonToast />
  </div>
</template>
