<script setup lang="ts">
const { user, isLoggedIn } = useAuth()
const route = useRoute()

/** 是否为沸点页（展示沸点专属右侧栏） */
const isPinPage = computed(() => route.path.startsWith('/pins'))

/** 进行中的活动（轮播展示） */
const ACTIVITIES = [
  { title: '项目征集 | AI作品招募开启', deadline: '截止日期 2026/12/26 17:00', cover: '/covers/cover-09.jpg' },
  { title: 'X-Lab 年度大会 · 作品展示招募', deadline: '截止日期 2026/12/20 23:59', cover: '/covers/cover-05.jpg' },
] as const

/** 推广位 */
const PROMOTIONS = [
  { title: 'AI Coding', desc: '让每一次编码更高效', icon: 'i-lucide:sparkles', color: 'bg-jj-primary' },
] as const

/** 底部版权链接 */
const FOOTER_LINKS = [
  '用户协议',
  '营业执照',
  '隐私政策',
  '关于我们',
  '使用指南',
  '友情链接',
  '更多文章',
] as const

/** 精选沸点（沸点页右侧栏） */
const FEATURED_PINS = [
  { content: '榨干两个家庭付了首付，接下来就慢慢还…', likes: 51, comments: 560, cover: '/covers/cover-01.jpg' },
  { content: '来来来，游戏ID报一下，想换个ID不知道叫啥，我参考一下', likes: 8, comments: 160, cover: '' },
  { content: '现在买油车是49年入国军还是在反清复明', likes: 29, comments: 356, cover: '/covers/cover-02.jpg' },
] as const

/** 推荐话题（沸点页右侧栏） */
const RECOMMEND_TOPICS = [
  { name: 'AI用量排行榜', count: '748k', badge: '荐' },
  { name: '2026年度精神食粮', count: '472k', badge: '荐奖' },
  { name: '黄仁勋回归英伟达', count: '239k', badge: '荐奖' },
  { name: '每日快讯', count: '14.3m', badge: '荐' },
  { name: '每天一个知识点', count: '65.2m', badge: '荐' },
  { name: 'JUEJIN FRIENDS 好好生活', count: '8.5m', badge: '' },
] as const

const currentYear = new Date().getFullYear()
</script>

<template>
  <aside class="flex w-64 shrink-0 flex-col gap-4 max-lg:hidden">
    <!-- ==================== 沸点页专属右侧栏 ==================== -->
    <template v-if="isPinPage">
      <!-- 用户卡片（含统计） -->
      <section class="rounded-jj-card bg-jj-bg-card p-4 shadow-jj-card">
        <template v-if="isLoggedIn">
          <div class="flex items-center gap-3">
            <NuxtLink :to="`/user/${user?.id}`">
              <BaseAvatar :src="user?.avatar" :size="48" />
            </NuxtLink>
            <div class="min-w-0 flex-1">
              <NuxtLink
                :to="`/user/${user?.id}`"
                class="truncate text-sm font-medium text-jj-text-1 hover:text-jj-primary"
              >
                {{ user?.nickname }}
              </NuxtLink>
              <p class="truncate text-xs text-jj-text-3">{{ user?.job }} @{{ user?.company }}</p>
            </div>
          </div>
          <div class="mt-3 grid grid-cols-4 gap-2 border-t border-jj-border pt-3 text-center">
            <div>
              <p class="text-base font-medium text-jj-text-1">{{ user?.articleCount ?? 0 }}</p>
              <p class="text-xs text-jj-text-3">沸点</p>
            </div>
            <div>
              <p class="text-base font-medium text-jj-text-1">0</p>
              <p class="text-xs text-jj-text-3">圈子</p>
            </div>
            <div>
              <p class="text-base font-medium text-jj-text-1">{{ user?.followCount ?? 0 }}</p>
              <p class="text-xs text-jj-text-3">关注</p>
            </div>
            <div>
              <p class="text-base font-medium text-jj-text-1">{{ user?.followerCount ?? 0 }}</p>
              <p class="text-xs text-jj-text-3">关注者</p>
            </div>
          </div>
        </template>
        <template v-else>
          <h2 class="text-sm font-medium text-jj-text-1">上午好，掘友！</h2>
          <p class="mt-1 text-xs text-jj-text-3">登录后即可签到，领取矿石奖励</p>
          <div class="mt-3 flex items-center gap-2">
            <BaseButton size="sm" @click="navigateTo('/login')">立即登录</BaseButton>
            <BaseButton variant="secondary" size="sm" @click="navigateTo('/register')">注册</BaseButton>
          </div>
        </template>
      </section>

      <!-- 签到卡片 -->
      <section class="flex items-center justify-between rounded-jj-card bg-jj-bg-card p-4 shadow-jj-card">
        <div>
          <p class="text-sm font-medium text-jj-text-1">下午好！</p>
          <p class="mt-0.5 text-xs text-jj-text-3">点亮在社区的每一天</p>
        </div>
        <BaseButton variant="secondary" size="sm" @click="navigateTo('/login')">去签到</BaseButton>
      </section>

      <!-- 精选沸点 -->
      <section class="rounded-jj-card bg-jj-bg-card shadow-jj-card">
        <div class="border-b border-jj-border px-4 py-3">
          <span class="text-sm font-medium text-jj-text-1">精选沸点</span>
        </div>
        <ul class="divide-y divide-jj-border">
          <li v-for="pin in FEATURED_PINS" :key="pin.content" class="flex gap-3 p-4">
            <div class="min-w-0 flex-1">
              <p class="line-clamp-2 text-sm text-jj-text-1">{{ pin.content }}</p>
              <p class="mt-1 text-xs text-jj-text-3">{{ pin.likes }}赞 · {{ pin.comments }}评论</p>
            </div>
            <img
              v-if="pin.cover"
              :src="pin.cover"
              alt="沸点配图"
              class="size-16 shrink-0 rounded object-cover"
            >
          </li>
        </ul>
      </section>

      <!-- 推荐话题 -->
      <section class="rounded-jj-card bg-jj-bg-card shadow-jj-card">
        <div class="flex items-center justify-between border-b border-jj-border px-4 py-3">
          <span class="text-sm font-medium text-jj-text-1">推荐话题</span>
          <button
            type="button"
            class="flex items-center gap-1 text-xs text-jj-text-3 transition-colors hover:text-jj-primary"
          >
            <Icon name="i-lucide:refresh-cw" class="size-3.5" />
            换一换
          </button>
        </div>
        <ul class="px-4 py-2">
          <li
            v-for="topic in RECOMMEND_TOPICS"
            :key="topic.name"
            class="flex items-center justify-between py-2"
          >
            <div class="flex min-w-0 items-center gap-1.5">
              <span
                v-if="topic.badge"
                class="shrink-0 rounded bg-jj-primary px-1 text-[10px] leading-4 text-white"
              >
                {{ topic.badge }}
              </span>
              <span class="truncate text-sm text-jj-text-1">#{{ topic.name }}#</span>
            </div>
            <span class="shrink-0 text-xs text-jj-text-3">{{ topic.count }}</span>
          </li>
        </ul>
        <div class="border-t border-jj-border px-4 py-2 text-center">
          <button
            type="button"
            class="text-xs text-jj-text-3 transition-colors hover:text-jj-primary"
          >
            查看更多 <Icon name="i-lucide:chevron-right" class="inline size-3" />
          </button>
        </div>
      </section>

      <!-- 如何玩转沸点 -->
      <section class="flex items-center gap-3 rounded-jj-card bg-jj-bg-card p-4 shadow-jj-card">
        <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-jj-primary/20 to-jj-primary/5">
          <Icon name="i-lucide:zap" class="size-5 text-jj-primary" />
        </div>
        <p class="text-sm font-medium text-jj-text-1">如何玩转沸点</p>
      </section>
    </template>

    <!-- ==================== 其他页面右侧栏（首页等） ==================== -->
    <template v-else>
      <!-- 签到 / 用户卡片 -->
      <section class="rounded-jj-card bg-jj-bg-card p-4 shadow-jj-card">
        <template v-if="isLoggedIn">
          <div class="flex items-center gap-3">
            <NuxtLink :to="`/user/${user?.id}`">
              <BaseAvatar :src="user?.avatar" :size="40" />
            </NuxtLink>
            <div class="min-w-0 flex-1">
              <NuxtLink
                :to="`/user/${user?.id}`"
                class="truncate text-sm font-medium text-jj-text-1 hover:text-jj-primary"
              >
                {{ user?.nickname }}
              </NuxtLink>
              <p class="truncate text-xs text-jj-text-3">Lv.{{ user?.level }} · {{ user?.description }}</p>
            </div>
          </div>
          <div class="mt-3 flex items-center gap-2">
            <BaseButton size="sm" class="flex-1" @click="navigateTo('/pins/publish')">
              <Icon name="i-lucide:pen-line" class="size-3.5" />
              发沸点
            </BaseButton>
            <BaseButton variant="secondary" size="sm" class="flex-1" @click="navigateTo('/creator')">
              创作者中心
            </BaseButton>
          </div>
        </template>
        <template v-else>
          <h2 class="text-sm font-medium text-jj-text-1">上午好，掘友！</h2>
          <p class="mt-1 text-xs text-jj-text-3">登录后即可签到，领取矿石奖励</p>
          <div class="mt-3 flex items-center gap-2">
            <BaseButton size="sm" @click="navigateTo('/login')">立即登录</BaseButton>
            <BaseButton variant="secondary" size="sm" @click="navigateTo('/register')">注册</BaseButton>
          </div>
        </template>
      </section>

      <!-- 进行中的活动 -->
      <section class="rounded-jj-card bg-jj-bg-card shadow-jj-card">
        <div class="flex items-center justify-between border-b border-jj-border px-4 py-3">
          <div class="flex items-center gap-2">
            <Icon name="i-lucide:calendar-check" class="size-4 text-jj-primary" />
            <span class="text-sm font-medium text-jj-text-1">进行中的活动</span>
          </div>
          <div class="flex items-center gap-1 text-xs text-jj-text-3">
            <button class="rounded p-1 hover:bg-jj-bg-hover" type="button">
              <Icon name="i-lucide:chevron-left" class="size-3.5" />
            </button>
            <span>{{ 1 }} / {{ ACTIVITIES.length }}</span>
            <button class="rounded p-1 hover:bg-jj-bg-hover" type="button">
              <Icon name="i-lucide:chevron-right" class="size-3.5" />
            </button>
          </div>
        </div>
        <div class="p-4">
          <NuxtLink to="#" class="flex gap-3">
            <img :src="ACTIVITIES[0].cover" :alt="ACTIVITIES[0].title" class="size-14 shrink-0 rounded object-cover">
            <div class="min-w-0 flex-1">
              <p class="line-clamp-2 text-sm text-jj-text-1">{{ ACTIVITIES[0].title }}</p>
              <p class="mt-1 text-xs text-jj-text-3">{{ ACTIVITIES[0].deadline }}</p>
            </div>
          </NuxtLink>
        </div>
      </section>

      <!-- 广告 / 推广 -->
      <section class="overflow-hidden rounded-jj-card bg-jj-bg-card shadow-jj-card">
        <a href="#" class="block">
          <img src="/covers/cover-08.jpg" alt="X-Lab 年度大会" class="h-28 w-full object-cover">
        </a>
      </section>

      <!-- AI Coding 推广 -->
      <section class="rounded-jj-card bg-gradient-to-r from-jj-primary/10 to-transparent p-4 shadow-jj-card">
        <div class="flex items-center gap-3">
          <div class="flex size-10 items-center justify-center rounded-lg bg-jj-primary text-white">
            <Icon :name="PROMOTIONS[0].icon" class="size-5" />
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium text-jj-text-1">{{ PROMOTIONS[0].title }}</p>
            <p class="text-xs text-jj-text-3">{{ PROMOTIONS[0].desc }}</p>
          </div>
          <Icon name="i-lucide:arrow-up-right" class="size-4 text-jj-primary" />
        </div>
      </section>
    </template>

    <!-- 版权信息（所有页面共用） -->
    <section class="px-1 text-xs leading-6 text-jj-text-3">
      <div class="flex flex-wrap gap-x-3 gap-y-1">
        <span v-for="link in FOOTER_LINKS" :key="link" class="cursor-pointer transition-colors hover:text-jj-primary">
          {{ link }}
        </span>
      </div>
      <p class="mt-2">举报邮箱：bd@xitu.io</p>
      <p>座机电话：010-83434395</p>
      <p>京ICP备18012699号-3</p>
      <p>京ICP证：京B2-20191272</p>
      <p class="mt-2">© {{ currentYear }} 掘金复刻</p>
    </section>
  </aside>
</template>
