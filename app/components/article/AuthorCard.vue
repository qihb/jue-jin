<script setup lang="ts">
import type { UserBrief } from '~~/shared/types'

const props = defineProps<{ author: UserBrief; following?: boolean }>()
</script>

<template>
  <section class="rounded-jj-card bg-jj-bg-card p-4 shadow-jj-card">
    <div class="flex items-center gap-3">
      <BaseAvatar :src="props.author.avatar" :size="44" />
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-medium text-jj-text-1">{{ props.author.nickname }}</p>
        <p class="mt-0.5 truncate text-xs text-jj-text-3">掘友等级 Lv{{ props.author.level }}</p>
      </div>
      <UserFollowButton :user-id="props.author.id" :initial="props.following" />
    </div>
    <p class="mt-3 text-xs leading-5 text-jj-text-3">{{ props.author.description }}</p>
  </section>
</template>
