<script setup lang="ts">
import type { UserProfile } from '~~/shared/types'

interface Props {
  profile: UserProfile
  /** 当前登录用户是否已关注 */
  following: boolean
  /** 是否查看的是本人主页（本人不展示关注按钮） */
  isSelf: boolean
  followLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  followLoading: false,
})

const emit = defineEmits<{ toggleFollow: [] }>()

const meta = computed(() => {
  const parts = [props.profile.job, props.profile.company].filter(Boolean)
  return parts.join(' · ')
})
</script>

<template>
  <section class="rounded-jj-card bg-jj-bg-card p-5 shadow-jj-card">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
      <BaseAvatar :src="props.profile.avatar" :size="72" />

      <div class="min-w-0 flex-1">
        <h1 class="truncate text-xl font-semibold text-jj-text-1">{{ props.profile.nickname }}</h1>
        <p class="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-jj-text-3">
          <span>@{{ props.profile.username }}</span>
          <span class="rounded bg-jj-bg-input px-1.5 py-0.5">Lv{{ props.profile.level }}</span>
          <span v-if="meta">{{ meta }}</span>
        </p>
        <p v-if="props.profile.description" class="mt-2 text-sm text-jj-text-2">
          {{ props.profile.description }}
        </p>
      </div>

      <div v-if="!props.isSelf" class="shrink-0">
        <BaseButton
          :variant="props.following ? 'secondary' : 'primary'"
          :loading="props.followLoading"
          @click="emit('toggleFollow')"
        >
          {{ props.following ? '已关注' : '关注' }}
        </BaseButton>
      </div>
    </div>

    <dl class="mt-5 grid grid-cols-4 gap-2 border-t border-jj-border pt-4 text-center">
      <div>
        <dt class="text-xs text-jj-text-3">掘力值</dt>
        <dd class="mt-1 text-sm font-medium text-jj-text-1">{{ formatCount(props.profile.power) }}</dd>
      </div>
      <div>
        <dt class="text-xs text-jj-text-3">关注</dt>
        <dd class="mt-1 text-sm font-medium text-jj-text-1">
          {{ formatCount(props.profile.followCount) }}
        </dd>
      </div>
      <div>
        <dt class="text-xs text-jj-text-3">粉丝</dt>
        <dd class="mt-1 text-sm font-medium text-jj-text-1">
          {{ formatCount(props.profile.followerCount) }}
        </dd>
      </div>
      <div>
        <dt class="text-xs text-jj-text-3">获赞</dt>
        <dd class="mt-1 text-sm font-medium text-jj-text-1">
          {{ formatCount(props.profile.likedCount) }}
        </dd>
      </div>
    </dl>
  </section>
</template>
