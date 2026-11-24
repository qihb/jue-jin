<script setup lang="ts">
const { isDark, toggleTheme } = useTheme()
const { user, isLoggedIn, loginWithDemo, logout } = useAuth()
const { unread } = await useNotificationSummary()

const NAV_ITEMS = [
  { label: '首页', to: '/', icon: 'i-lucide:house' },
  { label: '沸点', to: '/pins', icon: 'i-lucide:message-square' },
  { label: '小册', to: '/books', icon: 'i-lucide:book-open' },
  { label: '收藏集', to: '/collection', icon: 'i-lucide:folder' },
  { label: '排行榜', to: '/rank', icon: 'i-lucide:trophy' },
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
        <AppSearch />

        <BaseButton variant="secondary" size="sm" @click="navigateTo('/creator')">
          创作者中心
        </BaseButton>

        <button
          type="button"
          class="cursor-pointer rounded p-2 text-jj-text-2 transition-colors hover:bg-jj-bg-hover hover:text-jj-primary"
          :title="isDark ? '切换到浅色' : '切换到暗色'"
          @click="toggleTheme"
        >
          <Icon :name="isDark ? 'i-lucide:sun' : 'i-lucide:moon'" class="size-5" />
        </button>

        <NuxtLink
          to="/notification"
          class="relative rounded p-2 text-jj-text-2 transition-colors hover:bg-jj-bg-hover hover:text-jj-primary"
          title="消息"
          active-class="text-jj-primary"
        >
          <Icon name="i-lucide:bell" class="size-5" />
          <span
            v-if="unread.total > 0"
            class="absolute top-0.5 right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-jj-danger px-1 text-[10px] leading-none font-medium text-white"
          >
            {{ unread.total > 99 ? '99+' : unread.total }}
          </span>
        </NuxtLink>

        <div v-if="isLoggedIn" class="flex items-center gap-2">
          <BaseAvatar :src="user?.avatar" :size="28" />
          <span class="hidden max-w-24 truncate text-sm text-jj-text-2 sm:inline">
            {{ user?.nickname }}
          </span>
          <BaseButton variant="text" size="sm" @click="logout">退出</BaseButton>
        </div>
        <BaseButton v-else size="sm" @click="loginWithDemo">登录</BaseButton>
      </div>
    </div>
  </header>
</template>
