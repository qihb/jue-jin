<script setup lang="ts">
import { USER_PROFILE_TABS } from '~~/shared/constants'

const route = useRoute()
const id = computed(() => String(route.params.id))

const {
  profile,
  profileStatus,
  activeTab,
  setTab,
  articles,
  likes,
  pins,
  collections,
  followingList,
  listStatus,
  hasMore,
  loadingMore,
  loadMore,
  following,
  followLoading,
  toggleFollow,
  loginRequired,
} = await useUserProfile(id)

const { user, loginWithDemo } = useAuth()

const isSelf = computed(() => user.value?.id === id.value)
const notFound = computed(
  () => profileStatus.value === 'error' || (!profile.value && profileStatus.value !== 'pending'),
)
const tabs = USER_PROFILE_TABS.map((tab) => ({ label: tab.label, value: tab.value }))

usePageSeo({
  title: () => (profile.value ? `${profile.value.nickname} 的个人主页 - 掘金` : '用户主页 - 掘金'),
  description: () =>
    profile.value?.description || `${profile.value?.nickname ?? '掘金用户'} 在掘金的主页。`,
})

async function handleDemoLogin() {
  await loginWithDemo()
  loginRequired.value = false
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div v-if="notFound" class="rounded-jj-card bg-jj-bg-card py-12 shadow-jj-card">
      <BaseEmpty icon="i-lucide:user-x" description="用户不存在或已注销">
        <BaseButton class="mt-2" variant="secondary" @click="navigateTo('/')">返回首页</BaseButton>
      </BaseEmpty>
    </div>

    <template v-else>
      <UserProfileCard
        v-if="profile"
        :profile="profile"
        :following="following"
        :is-self="isSelf"
        :follow-loading="followLoading"
        @toggle-follow="toggleFollow"
      />

      <section v-else class="rounded-jj-card bg-jj-bg-card p-5 shadow-jj-card">
        <BaseSkeleton :width="72" :height="72" round />
        <BaseSkeleton class="mt-4" :height="20" width="40%" />
        <BaseSkeleton class="mt-2" :height="14" width="60%" />
      </section>

      <section class="rounded-jj-card bg-jj-bg-card pb-4 shadow-jj-card">
        <div class="px-4">
          <BaseTabs :model-value="activeTab" :items="tabs" @update:model-value="setTab" />
        </div>

        <ArticleList v-if="activeTab === 'articles'" :articles="articles" :status="listStatus" />
        <ArticleList v-else-if="activeTab === 'likes'" :articles="likes" :status="listStatus" />
        <PinList v-else-if="activeTab === 'pins'" :pins="pins" :status="listStatus" />

        <div v-else-if="activeTab === 'collections'">
          <div
            v-if="listStatus === 'pending' && collections.length === 0"
            class="grid gap-4 p-4 sm:grid-cols-2"
          >
            <BaseSkeleton v-for="row in 4" :key="row" :height="104" />
          </div>
          <BaseEmpty
            v-else-if="collections.length === 0"
            icon="i-lucide:folder-open"
            description="还没有收藏集"
          />
          <ul v-else class="grid gap-4 p-4 sm:grid-cols-2">
            <li v-for="item in collections" :key="item.id">
              <CollectionCard :collection="item" />
            </li>
          </ul>
        </div>

        <UserFollowingList
          v-else
          :users="followingList"
          :status="listStatus"
          :has-more="hasMore"
          :loading="loadingMore"
          @load="loadMore"
        />

        <div v-if="activeTab !== 'following'" class="px-4">
          <CommonLoadMore :has-more="hasMore" :loading="loadingMore" @load="loadMore" />
        </div>
      </section>
    </template>

    <BaseModal v-model="loginRequired" title="登录后即可关注" :width="360">
      <p class="text-sm text-jj-text-2">关注作者需要登录，当前为演示环境，可直接一键登录。</p>
      <template #footer>
        <BaseButton variant="secondary" @click="loginRequired = false">取消</BaseButton>
        <BaseButton @click="handleDemoLogin">一键演示登录</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
