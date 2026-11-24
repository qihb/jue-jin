<script setup lang="ts">
const { isDark, toggleTheme } = useTheme()

const NAV_ITEMS = [
  { label: '首页', to: '/', icon: 'i-lucide:house' },
  { label: '沸点', to: '/pins', icon: 'i-lucide:message-square' },
  { label: '课程', to: '/courses', icon: 'i-lucide:graduation-cap' },
  { label: '商城', to: '/shop', icon: 'i-lucide:shopping-bag' },
] as const
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-jj-border bg-jj-bg-card">
    <div class="mx-auto flex h-15 max-w-[1440px] items-center gap-4 px-4">
      <NuxtLink to="/" class="flex shrink-0 items-center gap-2">
        <span
          class="grid size-8 place-items-center rounded bg-jj-primary text-lg font-bold text-white"
        >
          掘
        </span>
        <span class="hidden text-lg font-semibold text-jj-text-1 sm:inline">掘金</span>
      </NuxtLink>

      <nav class="flex items-center gap-1">
        <NuxtLink
          v-for="item in NAV_ITEMS"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-1 rounded px-3 py-1.5 text-sm text-jj-text-2 transition-colors hover:bg-jj-bg-hover hover:text-jj-primary"
          active-class="text-jj-primary"
        >
          <Icon :name="item.icon" class="size-4" />
          <span class="hidden md:inline">{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <div class="ml-auto flex items-center gap-2">
        <div class="relative hidden w-60 lg:block">
          <Icon
            name="i-lucide:search"
            class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-jj-text-3"
          />
          <input
            type="search"
            placeholder="搜索文章 / 沸点 / 用户"
            class="h-8 w-full rounded bg-jj-bg-input pr-3 pl-9 text-sm text-jj-text-1 outline-none placeholder:text-jj-text-3 focus:ring-1 focus:ring-jj-primary"
          >
        </div>

        <BaseButton variant="secondary" size="sm">创作者中心</BaseButton>

        <button
          type="button"
          class="cursor-pointer rounded p-2 text-jj-text-2 transition-colors hover:bg-jj-bg-hover hover:text-jj-primary"
          :title="isDark ? '切换到浅色' : '切换到暗色'"
          @click="toggleTheme"
        >
          <Icon :name="isDark ? 'i-lucide:sun' : 'i-lucide:moon'" class="size-5" />
        </button>

        <button
          type="button"
          class="relative cursor-pointer rounded p-2 text-jj-text-2 transition-colors hover:bg-jj-bg-hover hover:text-jj-primary"
          title="消息"
        >
          <Icon name="i-lucide:bell" class="size-5" />
        </button>

        <BaseButton size="sm">登录</BaseButton>
      </div>
    </div>
  </header>
</template>
