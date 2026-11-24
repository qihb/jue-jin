<script setup lang="ts">
import { NAV_ITEMS } from '~~/shared/constants'

const { user, isLoggedIn } = useAuth()
const { unread } = await useNotificationSummary()
const appStore = useAppStore()

/** 创作者中心下拉 */
const creatorOpen = ref(false)
/** 个人中心下拉 */
const userOpen = ref(false)

function openCreator() {
  creatorOpen.value = !creatorOpen.value
  userOpen.value = false
}

function openUser() {
  userOpen.value = !userOpen.value
  creatorOpen.value = false
}
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-jj-border bg-jj-bg-card">
    <div class="mx-auto flex h-15 max-w-[1440px] items-center gap-2 px-4 sm:gap-4">
      <button
        type="button"
        class="cursor-pointer rounded p-1.5 text-jj-text-2 transition-colors hover:bg-jj-bg-hover hover:text-jj-primary lg:hidden"
        title="菜单"
        @click="appStore.openMobileNav"
      >
        <Icon name="i-lucide:menu" class="size-5" />
      </button>

      <NuxtLink to="/" class="flex shrink-0 items-center gap-2">
        <span
          class="grid size-8 place-items-center rounded bg-jj-primary text-lg font-bold text-white"
        >
          掘
        </span>
        <span class="hidden text-lg font-semibold text-jj-text-1 sm:inline">掘金</span>
      </NuxtLink>

      <nav class="hidden items-center gap-1 lg:flex">
        <template v-for="item in NAV_ITEMS" :key="item.to">
          <NuxtLink
            v-if="!item.external"
            :to="item.to"
            class="rounded px-3 py-1.5 text-sm text-jj-text-2 transition-colors hover:bg-jj-bg-hover hover:text-jj-primary"
            active-class="text-jj-primary"
          >
            {{ item.label }}
          </NuxtLink>
          <a
            v-else
            :href="item.to"
            target="_blank"
            rel="noopener noreferrer"
            class="rounded px-3 py-1.5 text-sm text-jj-text-2 transition-colors hover:bg-jj-bg-hover hover:text-jj-primary"
          >
            {{ item.label }}
          </a>
        </template>
      </nav>

      <div class="ml-auto flex items-center gap-3">
        <AppSearch />

        <!-- 创作者中心（蓝色按钮 + 下拉） -->
        <CreatorCenterMenu v-model="creatorOpen">
          <button
            type="button"
            class="flex items-center gap-1 rounded bg-jj-primary px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-jj-primary-hover"
            @click="openCreator"
          >
            创作者中心
            <Icon
              name="i-lucide:chevron-down"
              class="size-3.5 transition-transform"
              :class="creatorOpen && 'rotate-180'"
            />
          </button>
        </CreatorCenterMenu>

        <!-- 消息铃铛 -->
        <NuxtLink
          to="/notification"
          class="relative rounded p-1 text-jj-text-2 transition-colors hover:bg-jj-bg-hover hover:text-jj-primary"
          title="消息"
          active-class="text-jj-primary"
        >
          <Icon name="i-lucide:bell" class="size-5" />
          <span
            v-if="unread.total > 0"
            class="absolute top-0 right-0 grid h-4 min-w-4 place-items-center rounded-full bg-jj-danger px-1 text-[10px] leading-none font-medium text-white"
          >
            {{ unread.total > 99 ? '99+' : unread.total }}
          </span>
        </NuxtLink>

        <!-- 头像（个人中心下拉） -->
        <UserMenu v-if="isLoggedIn && user" v-model="userOpen" :user="user">
          <button
            type="button"
            class="rounded-full ring-2 ring-transparent transition-all hover:ring-jj-primary/40"
            @click="openUser"
          >
            <BaseAvatar :src="user.avatar" :size="32" />
          </button>
        </UserMenu>

        <BaseButton v-else size="sm" @click="navigateTo('/login')">登录</BaseButton>
      </div>
    </div>

    <AppNavDrawer />
  </header>
</template>
