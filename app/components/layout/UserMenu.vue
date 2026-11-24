<script setup lang="ts">
import type { User } from '~~/shared/types'

const props = defineProps<{ user: User }>()
const { logout } = useAuth()
const { isDark, toggleTheme } = useTheme()

const visible = defineModel<boolean>({ default: false })

/** 矿石（掘力值）展示 */
const oreText = computed(() => formatCount(props.user.power))

/** 掘友等级进度：每 2000 掘力值升一级，当前进度百分比 */
const levelProgress = computed(() => {
  const current = props.user.power % 2000
  return Math.round((current / 2000) * 1000) / 10
})

const levelText = computed(() => `JY.${props.user.level}`)

/** 菜单项（双列布局） */
const MENU_GROUPS: { label: string; icon: string; to: string; badge?: boolean }[][] = [
  [
    { label: '我的主页', icon: 'i-lucide:user', to: `/user/${props.user.id}` },
    { label: '成长福利', icon: 'i-lucide:gift', to: '/benefits' },
  ],
  [
    { label: '闪念笔记', icon: 'i-lucide:notebook-pen', to: '/notes', badge: true },
    { label: '课程中心', icon: 'i-lucide:book-open', to: '/courses' },
  ],
  [
    { label: '我的优惠', icon: 'i-lucide:ticket', to: '/coupons' },
    { label: '我的足迹', icon: 'i-lucide:footprints', to: '/footprints' },
  ],
]

function handleLogout() {
  visible.value = false
  void logout()
}

const rootRef = ref<HTMLElement | null>(null)
onClickOutside(rootRef, () => {
  visible.value = false
})
</script>

<template>
  <div ref="rootRef" class="relative">
    <slot :open="visible" />

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="translate-y-1 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-1 opacity-0"
    >
      <div
        v-if="visible"
        class="absolute right-0 top-full z-50 mt-2 w-72 rounded-lg bg-jj-bg-card shadow-xl ring-1 ring-jj-border"
      >
        <!-- 用户信息 -->
        <div class="flex items-center gap-3 p-4">
          <NuxtLink :to="`/user/${user.id}`" @click="visible = false">
            <BaseAvatar :src="user.avatar" :size="48" />
          </NuxtLink>
          <div class="min-w-0 flex-1">
            <NuxtLink
              :to="`/user/${user.id}`"
              class="truncate text-sm font-medium text-jj-text-1 hover:text-jj-primary"
              @click="visible = false"
            >
              {{ user.nickname }}
            </NuxtLink>
            <NuxtLink
              :to="`/user/${user.id}`"
              class="mt-0.5 flex items-center gap-0.5 text-xs text-jj-text-3 hover:text-jj-primary"
              @click="visible = false"
            >
              矿石: {{ oreText }}
              <Icon name="i-lucide:chevron-right" class="size-3" />
            </NuxtLink>
          </div>
        </div>

        <!-- 等级进度 -->
        <div class="mx-4 mb-3 rounded-lg bg-jj-bg-input p-3">
          <div class="flex items-center justify-between text-xs">
            <span class="font-medium text-jj-primary">掘友等级 {{ levelText }}</span>
            <span class="text-jj-text-3">
              {{ levelProgress }} / 2000
              <Icon name="i-lucide:chevron-right" class="inline size-3" />
            </span>
          </div>
          <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-jj-border">
            <div
              class="h-full rounded-full bg-jj-primary transition-all"
              :style="{ width: `${(levelProgress / 2000) * 100}%` }"
            />
          </div>
        </div>

        <!-- 统计 -->
        <div class="grid grid-cols-3 border-y border-jj-border py-3 text-center">
          <div>
            <p class="text-base font-medium text-jj-text-1">{{ user.followCount }}</p>
            <p class="mt-0.5 text-xs text-jj-text-3">关注</p>
          </div>
          <div>
            <p class="text-base font-medium text-jj-text-1">{{ user.likedCount }}</p>
            <p class="mt-0.5 text-xs text-jj-text-3">赞过</p>
          </div>
          <div>
            <p class="text-base font-medium text-jj-text-1">0</p>
            <p class="mt-0.5 text-xs text-jj-text-3">收藏</p>
          </div>
        </div>

        <!-- 菜单列表 -->
        <div class="p-2">
          <div v-for="(group, gi) in MENU_GROUPS" :key="gi" class="grid grid-cols-2">
            <NuxtLink
              v-for="item in group"
              :key="item.label"
              :to="item.to"
              class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-jj-text-2 transition-colors hover:bg-jj-bg-hover hover:text-jj-primary"
              @click="visible = false"
            >
              <Icon :name="item.icon" class="size-4" />
              <span class="relative">
                {{ item.label }}
                <span
                  v-if="item.badge"
                  class="absolute -top-1 -right-2 size-1.5 rounded-full bg-jj-danger"
                />
              </span>
            </NuxtLink>
          </div>
        </div>

        <!-- 底部：设置 + 主题 + 退出 -->
        <div class="flex items-center justify-between border-t border-jj-border px-4 py-3">
          <NuxtLink
            to="/settings/profile"
            class="text-sm text-jj-text-3 transition-colors hover:text-jj-primary"
            @click="visible = false"
          >
            我的设置
          </NuxtLink>
          <button
            type="button"
            class="flex items-center gap-1 text-sm text-jj-text-3 transition-colors hover:text-jj-primary"
            @click="toggleTheme"
          >
            <Icon :name="isDark ? 'i-lucide:sun' : 'i-lucide:moon'" class="size-4" />
            {{ isDark ? '浅色' : '暗色' }}
          </button>
          <button
            type="button"
            class="text-sm text-jj-text-3 transition-colors hover:text-jj-danger"
            @click="handleLogout"
          >
            退出登录
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
