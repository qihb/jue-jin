<script setup lang="ts">
const route = useRoute()
const { isLoggedIn, loginWithPassword, loginWithDemo } = useAuth()

/** 登录成功后的跳转目标（来自 `redirect` query） */
const redirect = computed(() => {
  const value = route.query.redirect
  return typeof value === 'string' && value ? value : '/'
})

// 已登录直接回跳
if (isLoggedIn.value) {
  await navigateTo(redirect.value)
}

const username = ref('')
const password = ref('')
const submitting = ref(false)
const demoSubmitting = ref(false)

async function handleSubmit() {
  if (submitting.value) return
  if (!username.value.trim() || !password.value) {
    pushToast('请输入用户名和密码')
    return
  }
  submitting.value = true
  try {
    await loginWithPassword(username.value.trim(), password.value)
    await navigateTo(redirect.value)
  } catch {
    // 失败提示已由 useRequest 统一弹出
  } finally {
    submitting.value = false
  }
}

async function handleDemoLogin() {
  if (demoSubmitting.value) return
  demoSubmitting.value = true
  try {
    await loginWithDemo()
    await navigateTo(redirect.value)
  } catch {
    // 失败提示已由 useRequest 统一弹出
  } finally {
    demoSubmitting.value = false
  }
}

usePageSeo({
  title: '登录 - 掘金',
  description: '登录掘金，继续你的技术创作与交流。',
})
</script>

<template>
  <div class="mx-auto w-full max-w-md py-6">
    <section class="rounded-jj-card bg-jj-bg-card p-6 shadow-jj-card sm:p-8">
      <h1 class="text-xl font-semibold text-jj-text-1">登录掘金</h1>
      <p class="mt-1 text-sm text-jj-text-3">登录后即可点赞、评论、关注与发布内容</p>

      <form class="mt-6 flex flex-col gap-4" @submit.prevent="handleSubmit">
        <label class="flex flex-col gap-1.5">
          <span class="text-sm text-jj-text-2">用户名</span>
          <input
            v-model="username"
            type="text"
            autocomplete="username"
            placeholder="请输入用户名"
            class="h-10 w-full rounded bg-jj-bg-input px-3 text-sm text-jj-text-1 outline-none placeholder:text-jj-text-3 focus:ring-1 focus:ring-jj-primary"
          >
        </label>

        <label class="flex flex-col gap-1.5">
          <span class="text-sm text-jj-text-2">密码</span>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            placeholder="请输入密码"
            class="h-10 w-full rounded bg-jj-bg-input px-3 text-sm text-jj-text-1 outline-none placeholder:text-jj-text-3 focus:ring-1 focus:ring-jj-primary"
          >
        </label>

        <BaseButton block size="lg" native-type="submit" :loading="submitting">登录</BaseButton>
      </form>

      <div class="my-5 flex items-center gap-3 text-xs text-jj-text-3">
        <span class="h-px flex-1 bg-jj-border" />
        或
        <span class="h-px flex-1 bg-jj-border" />
      </div>

      <BaseButton
        block
        size="lg"
        variant="secondary"
        :loading="demoSubmitting"
        @click="handleDemoLogin"
      >
        一键演示登录
      </BaseButton>
      <p class="mt-2 text-center text-xs text-jj-text-3">
        无需账号，点击即登录为演示用户（用户名 <code class="text-jj-text-2">juejin_1</code>）
      </p>

      <p class="mt-6 text-center text-sm text-jj-text-3">
        还没有账号？
        <NuxtLink
          :to="{ path: '/register', query: route.query }"
          class="text-jj-primary hover:underline"
        >
          立即注册
        </NuxtLink>
      </p>
    </section>
  </div>
</template>
