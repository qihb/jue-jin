<script setup lang="ts">
import { NOTIFICATION_TABS, getNotificationTabName } from '~~/shared/constants'

const { isLoggedIn } = useAuth()
const { tab, setTab, items, status, hasMore, loadingMore, loadMore, refresh, markRead } =
  await useNotification()
const { unread, refresh: refreshUnread } = await useNotificationSummary()

const activeTab = computed({
  get: () => tab.value,
  set: (value: string) => setTab(value),
})

const tabItems = computed(() =>
  NOTIFICATION_TABS.map((item) => ({
    label: item.name,
    value: item.id,
    badge: unread.value.byTab[item.id],
  })),
)

const tabName = computed(() => getNotificationTabName(tab.value))

const marking = ref(false)

/** 全部已读：标记后刷新列表与未读统计 */
async function handleMarkAll() {
  if (marking.value) return
  marking.value = true
  try {
    await markRead()
    await refreshUnread()
  } finally {
    marking.value = false
  }
}

/** 登录成功后重新拉取消息与未读统计（含头部一键登录） */
watch(isLoggedIn, async (loggedIn) => {
  if (!loggedIn) return
  await Promise.all([refresh(), refreshUnread()])
})

usePageSeo({
  title: '消息中心 - 掘金',
  description: '掘金消息中心 · 赞和收藏、评论、@我、关注与系统通知。',
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <section class="rounded-jj-card bg-jj-bg-card px-4 shadow-jj-card">
      <BaseTabs v-model="activeTab" :items="tabItems" />
    </section>

    <section class="rounded-jj-card bg-jj-bg-card shadow-jj-card">
      <div class="flex items-center justify-between gap-3 border-b border-jj-border px-4 py-3">
        <h1 class="text-sm font-medium text-jj-text-1">{{ tabName }}</h1>
        <BaseButton
          v-if="isLoggedIn && unread.total > 0"
          variant="text"
          size="sm"
          :loading="marking"
          @click="handleMarkAll"
        >
          全部已读
        </BaseButton>
      </div>

      <div v-if="!isLoggedIn" class="py-4">
        <CommonLoginGate icon="i-lucide:bell-off" description="登录后即可查看消息" />
      </div>

      <template v-else>
        <NotificationList :items="items" :status="status" />
        <div class="px-4">
          <CommonLoadMore :has-more="hasMore" :loading="loadingMore" @load="loadMore" />
        </div>
      </template>
    </section>
  </div>
</template>
