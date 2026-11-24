<script setup lang="ts">
// 文章详情布局：顶部导航 + 居中内容区 + 页脚（使用文章自身的右侧栏，不挂首页侧栏）
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <AppHeader />

    <main class="mx-auto w-full max-w-[1200px] flex-1 px-4 py-4">
      <slot />
    </main>

    <AppFooter />
  </div>
</template>
