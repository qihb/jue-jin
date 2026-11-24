<script setup lang="ts">
/** 设置页左侧导航项 */
const links = [
  { to: '/settings/profile', label: '个人资料', icon: 'i-lucide:user-round' },
  { to: '/settings/account', label: '账号设置', icon: 'i-lucide:shield-check' },
] as const
</script>

<template>
  <nav class="flex gap-1 rounded-jj-card bg-jj-bg-card p-2 shadow-jj-card lg:flex-col">
    <NuxtLink
      v-for="link in links"
      :key="link.to"
      :to="link.to"
      class="flex flex-1 items-center justify-center gap-2 rounded px-3 py-2.5 text-sm text-jj-text-2 transition-colors hover:bg-jj-bg-hover hover:text-jj-primary lg:flex-none lg:justify-start"
      active-class="bg-jj-bg-hover text-jj-primary"
    >
      <Icon :name="link.icon" class="size-4" />
      {{ link.label }}
    </NuxtLink>
  </nav>
</template>
