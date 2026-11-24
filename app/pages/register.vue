<script setup lang="ts">
import { PASSWORD_MIN_LENGTH, USERNAME_PATTERN } from '~~/shared/constants'

const route = useRoute()
const { isLoggedIn, register } = useAuth()

/** 注册成功后的跳转目标 */
const redirect = computed(() => {
  const value = route.query.redirect
  return typeof value === 'string' && value ? value : '/'
})

if (isLoggedIn.value) {
  await navigateTo(redirect.value)
}

const username = ref('')
const nickname = ref('')
const password = ref('')
const confirmPassword = ref('')
const submitting = ref(false)

async function handleSubmit() {
  if (submitting.value) return

  if (!USERNAME_PATTERN.test(username.value.trim())) {
    pushToast('用户名需为 4~20 位字母、数字或下划线')
    return
  }
  if (!nickname.value.trim()) {
    pushToast('请输入昵称')
    return
  }
  if (password.value.length < PASSWORD_MIN_LENGTH) {
    pushToast(`密码至少 ${PASSWORD_MIN_LENGTH} 位`)
    return
  }
  if (password.value !== confirmPassword.value) {
    pushToast('两次输入的密码不一致')
    return
  }

  submitting.value = true
  try {
    await register({
      username: username.value.trim(),
      nickname: nickname.value.trim(),
      password: password.value,
    })
    await navigateTo(redirect.value)
  } catch {
    // 失败提示已由 useRequest 统一弹出
  } finally {
    submitting.value = false
  }
}

usePageSeo({
  title: '注册 - 掘金',
  description: '注册掘金账号，加入开发者社区。',
})
</script>

<template>
  <div class="mx-auto w-full max-w-md py-6">
    <section class="rounded-jj-card bg-jj-bg-card p-6 shadow-jj-card sm:p-8">
      <h1 class="text-xl font-semibold text-jj-text-1">注册掘金</h1>
      <p class="mt-1 text-sm text-jj-text-3">创建一个账号，开始你的技术创作</p>

      <form class="mt-6 flex flex-col gap-4" @submit.prevent="handleSubmit">
        <label class="flex flex-col gap-1.5">
          <span class="text-sm text-jj-text-2">用户名</span>
          <input
            v-model="username"
            type="text"
            autocomplete="username"
            placeholder="4~20 位字母、数字或下划线"
            class="h-10 w-full rounded bg-jj-bg-input px-3 text-sm text-jj-text-1 outline-none placeholder:text-jj-text-3 focus:ring-1 focus:ring-jj-primary"
          >
        </label>

        <label class="flex flex-col gap-1.5">
          <span class="text-sm text-jj-text-2">昵称</span>
          <input
            v-model="nickname"
            type="text"
            autocomplete="nickname"
            placeholder="请输入昵称"
            class="h-10 w-full rounded bg-jj-bg-input px-3 text-sm text-jj-text-1 outline-none placeholder:text-jj-text-3 focus:ring-1 focus:ring-jj-primary"
          >
        </label>

        <label class="flex flex-col gap-1.5">
          <span class="text-sm text-jj-text-2">密码</span>
          <input
            v-model="password"
            type="password"
            autocomplete="new-password"
            placeholder="至少 6 位"
            class="h-10 w-full rounded bg-jj-bg-input px-3 text-sm text-jj-text-1 outline-none placeholder:text-jj-text-3 focus:ring-1 focus:ring-jj-primary"
          >
        </label>

        <label class="flex flex-col gap-1.5">
          <span class="text-sm text-jj-text-2">确认密码</span>
          <input
            v-model="confirmPassword"
            type="password"
            autocomplete="new-password"
            placeholder="请再次输入密码"
            class="h-10 w-full rounded bg-jj-bg-input px-3 text-sm text-jj-text-1 outline-none placeholder:text-jj-text-3 focus:ring-1 focus:ring-jj-primary"
          >
        </label>

        <BaseButton block size="lg" native-type="submit" :loading="submitting">注册</BaseButton>
      </form>

      <p class="mt-6 text-center text-sm text-jj-text-3">
        已有账号？
        <NuxtLink :to="{ path: '/login', query: route.query }" class="text-jj-primary hover:underline">
          去登录
        </NuxtLink>
      </p>
    </section>
  </div>
</template>
