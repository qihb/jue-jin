<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const keyword = ref(typeof route.query.q === 'string' ? route.query.q : '')

// 搜索页内输入 / 前进后退时，与 URL query 保持同步
watch(
  () => route.query.q,
  (value) => {
    const next = typeof value === 'string' ? value : ''
    if (next !== keyword.value) keyword.value = next
  },
)

/** 已进入搜索页时原地替换 query（避免污染历史），否则跳转到搜索页 */
function goSearch(value: string) {
  const q = value.trim()
  if (!q) return
  if (route.path === '/search') {
    void router.replace({ query: { ...route.query, q } })
  } else {
    void router.push({ path: '/search', query: { q } })
  }
}

// 输入防抖：停止输入 400ms 后触发检索
const runSearch = useDebounceFn(goSearch, 400)

function handleSubmit() {
  goSearch(keyword.value)
}
</script>

<template>
  <form class="relative hidden w-60 lg:block" @submit.prevent="handleSubmit">
    <Icon
      name="i-lucide:search"
      class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-jj-text-3"
    />
    <input
      v-model="keyword"
      type="search"
      placeholder="搜索文章 / 沸点 / 用户"
      class="h-8 w-full rounded bg-jj-bg-input pr-3 pl-9 text-sm text-jj-text-1 outline-none placeholder:text-jj-text-3 focus:ring-1 focus:ring-jj-primary"
      @input="runSearch(keyword)"
      @keydown.enter.prevent="handleSubmit"
    >
  </form>
</template>
