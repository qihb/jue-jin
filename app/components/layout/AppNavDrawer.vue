<script setup lang="ts">
import { NAV_ITEMS } from '~~/shared/constants'

const route = useRoute()
const appStore = useAppStore()
const { user, isLoggedIn, loginWithDemo, logout } = useAuth()

/** 抽屉开关直接读 store，由 AppHeader 的汉堡按钮控制 */
const visible = computed({
  get: () => appStore.mobileNavOpen,
  set: (value) => {
    if (value) appStore.openMobileNav()
    else appStore.closeMobileNav()
  },
})

const bodyRef = shallowRef<HTMLElement | null>(null)
const isLocked = useScrollLock(bodyRef)

onMounted(() => {
  bodyRef.value = document.body
})

watch(visible, (value) => {
  isLocked.value = value
})

// 路由切换后自动收起抽屉
watch(
  () => route.fullPath,
  () => {
    visible.value = false
  },
)

const keyword = ref('')

function handleSearch() {
  const q = keyword.value.trim()
  visible.value = false
  keyword.value = ''
  navigateTo(q ? { path: '/search', query: { q } } : '/search')
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="visible"
        class="fixed inset-0 z-50 bg-jj-bg-mask lg:hidden"
        @click.self="visible = false"
      >
        <Transition
          appear
          enter-active-class="transition-transform duration-200"
          leave-active-class="transition-transform duration-200"
          enter-from-class="-translate-x-full"
          leave-to-class="-translate-x-full"
        >
          <div class="flex h-full w-72 max-w-[80vw] flex-col bg-jj-bg-card shadow-lg">
            <header class="flex h-14 shrink-0 items-center justify-between px-4">
              <NuxtLink to="/" class="flex items-center gap-2">
                <span
                  class="grid size-8 place-items-center rounded bg-jj-primary text-lg font-bold text-white"
                >
                  掘
                </span>
                <span class="text-base font-semibold text-jj-text-1">掘金</span>
              </NuxtLink>
              <button
                type="button"
                class="cursor-pointer rounded p-1.5 text-jj-text-3 transition-colors hover:bg-jj-bg-hover hover:text-jj-text-1"
                title="关闭"
                @click="visible = false"
              >
                <Icon name="i-lucide:x" class="size-5" />
              </button>
            </header>

            <div class="px-4 pb-2">
              <form class="relative" @submit.prevent="handleSearch">
                <Icon
                  name="i-lucide:search"
                  class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-jj-text-3"
                />
                <input
                  v-model="keyword"
                  type="search"
                  placeholder="搜索文章 / 沸点 / 用户"
                  class="h-9 w-full rounded bg-jj-bg-input pr-3 pl-9 text-sm text-jj-text-1 outline-none placeholder:text-jj-text-3 focus:ring-1 focus:ring-jj-primary"
                >
              </form>
            </div>

            <nav class="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-2">
              <NuxtLink
                v-for="item in NAV_ITEMS"
                :key="item.to"
                :to="item.to"
                class="flex items-center gap-3 rounded px-3 py-2.5 text-sm text-jj-text-2 transition-colors hover:bg-jj-bg-hover hover:text-jj-primary"
                active-class="bg-jj-bg-hover text-jj-primary"
              >
                <Icon :name="item.icon" class="size-4.5" />
                {{ item.label }}
              </NuxtLink>
              <NuxtLink
                to="/creator"
                class="mt-1 flex items-center gap-3 rounded border-t border-jj-border px-3 py-2.5 pt-3 text-sm text-jj-text-2 transition-colors hover:bg-jj-bg-hover hover:text-jj-primary"
                active-class="text-jj-primary"
              >
                <Icon name="i-lucide:pen-square" class="size-4.5" />
                创作者中心
              </NuxtLink>
            </nav>

            <footer class="border-t border-jj-border p-4">
              <div v-if="isLoggedIn" class="flex items-center gap-3">
                <BaseAvatar :src="user?.avatar" :size="36" />
                <span class="min-w-0 flex-1 truncate text-sm font-medium text-jj-text-1">
                  {{ user?.nickname }}
                </span>
                <BaseButton variant="secondary" size="sm" @click="logout">退出</BaseButton>
              </div>
              <BaseButton v-else block size="sm" @click="loginWithDemo">登录</BaseButton>
            </footer>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
