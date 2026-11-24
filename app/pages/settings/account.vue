<script setup lang="ts">
import { PASSWORD_MIN_LENGTH } from '~~/shared/constants'

definePageMeta({ middleware: 'auth' })

const { profile } = await useUserSettings()
const { changePassword, logout } = useAuth()

const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const changing = ref(false)

async function handleChangePassword() {
  if (changing.value) return

  if (!oldPassword.value) {
    pushToast('请输入当前密码')
    return
  }
  if (newPassword.value.length < PASSWORD_MIN_LENGTH) {
    pushToast(`新密码至少 ${PASSWORD_MIN_LENGTH} 位`)
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    pushToast('两次输入的新密码不一致')
    return
  }

  changing.value = true
  try {
    await changePassword(oldPassword.value, newPassword.value)
    pushToast('密码已修改', 'success')
    oldPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch {
    // 失败提示已由 useRequest 统一弹出
  } finally {
    changing.value = false
  }
}

async function handleLogout() {
  await logout()
  await navigateTo('/')
}

usePageSeo({
  title: '账号设置 - 掘金',
  description: '管理你的掘金账号：账号信息、修改密码与账号绑定。',
})
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[200px_1fr] lg:items-start">
    <SettingsNav />

    <div class="flex flex-col gap-4">
      <section class="rounded-jj-card bg-jj-bg-card p-6 shadow-jj-card">
        <h2 class="text-base font-semibold text-jj-text-1">账号信息</h2>
        <dl class="mt-4 flex flex-col gap-3 text-sm">
          <div class="flex items-center gap-4">
            <dt class="w-20 shrink-0 text-jj-text-3">掘金号</dt>
            <dd class="text-jj-text-1">{{ profile?.username ?? '—' }}</dd>
          </div>
          <div class="flex items-center gap-4">
            <dt class="w-20 shrink-0 text-jj-text-3">注册时间</dt>
            <dd class="text-jj-text-1">
              {{ profile ? formatDateTime(profile.createdAt) : '—' }}
            </dd>
          </div>
        </dl>
      </section>

      <section class="rounded-jj-card bg-jj-bg-card p-6 shadow-jj-card">
        <h2 class="text-base font-semibold text-jj-text-1">修改密码</h2>
        <p class="mt-1 text-sm text-jj-text-3">修改后需使用新密码重新登录</p>

        <form class="mt-5 flex flex-col gap-4" @submit.prevent="handleChangePassword">
          <label class="flex flex-col gap-1.5">
            <span class="text-sm text-jj-text-2">当前密码</span>
            <input
              v-model="oldPassword"
              type="password"
              autocomplete="current-password"
              placeholder="请输入当前密码"
              class="h-10 w-full rounded bg-jj-bg-input px-3 text-sm text-jj-text-1 outline-none placeholder:text-jj-text-3 focus:ring-1 focus:ring-jj-primary"
            >
          </label>

          <label class="flex flex-col gap-1.5">
            <span class="text-sm text-jj-text-2">新密码</span>
            <input
              v-model="newPassword"
              type="password"
              autocomplete="new-password"
              :placeholder="`至少 ${PASSWORD_MIN_LENGTH} 位`"
              class="h-10 w-full rounded bg-jj-bg-input px-3 text-sm text-jj-text-1 outline-none placeholder:text-jj-text-3 focus:ring-1 focus:ring-jj-primary"
            >
          </label>

          <label class="flex flex-col gap-1.5">
            <span class="text-sm text-jj-text-2">确认新密码</span>
            <input
              v-model="confirmPassword"
              type="password"
              autocomplete="new-password"
              placeholder="请再次输入新密码"
              class="h-10 w-full rounded bg-jj-bg-input px-3 text-sm text-jj-text-1 outline-none placeholder:text-jj-text-3 focus:ring-1 focus:ring-jj-primary"
            >
          </label>

          <div class="flex justify-end">
            <BaseButton size="md" native-type="submit" :loading="changing">保存新密码</BaseButton>
          </div>
        </form>
      </section>

      <section class="rounded-jj-card bg-jj-bg-card p-6 shadow-jj-card">
        <h2 class="text-base font-semibold text-jj-text-1">账号绑定</h2>
        <dl class="mt-4 flex flex-col gap-3 text-sm">
          <div class="flex items-center gap-4">
            <dt class="w-20 shrink-0 text-jj-text-3">邮箱</dt>
            <dd class="text-jj-text-1">{{ profile?.email || '未绑定' }}</dd>
          </div>
          <div class="flex items-center gap-4">
            <dt class="w-20 shrink-0 text-jj-text-3">手机</dt>
            <dd class="text-jj-text-3">未绑定（暂不支持）</dd>
          </div>
        </dl>
      </section>

      <section class="rounded-jj-card bg-jj-bg-card p-6 shadow-jj-card">
        <h2 class="text-base font-semibold text-jj-text-1">退出登录</h2>
        <div class="mt-4">
          <BaseButton variant="danger" @click="handleLogout">退出当前账号</BaseButton>
        </div>
      </section>
    </div>
  </div>
</template>
