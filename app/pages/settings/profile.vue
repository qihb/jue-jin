<script setup lang="ts">
import { EMAIL_PATTERN, NICKNAME_MAX_LENGTH, USER_DESCRIPTION_MAX_LENGTH } from '~~/shared/constants'

definePageMeta({ middleware: 'auth' })

const { form, saving, saveProfile } = await useUserSettings()

async function handleSubmit() {
  if (saving.value) return

  const nickname = form.nickname.trim()
  if (!nickname) {
    pushToast('请输入昵称')
    return
  }
  if (nickname.length > NICKNAME_MAX_LENGTH) {
    pushToast(`昵称不能超过 ${NICKNAME_MAX_LENGTH} 个字符`)
    return
  }
  if (form.description.trim().length > USER_DESCRIPTION_MAX_LENGTH) {
    pushToast(`个人简介不能超过 ${USER_DESCRIPTION_MAX_LENGTH} 个字符`)
    return
  }
  if (form.email.trim() && !EMAIL_PATTERN.test(form.email.trim())) {
    pushToast('邮箱格式不正确')
    return
  }

  const success = await saveProfile()
  if (success) pushToast('资料已更新', 'success')
}

usePageSeo({
  title: '个人资料 - 掘金',
  description: '编辑你的掘金个人资料，同步更新昵称、头像与简介。',
})
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[200px_1fr] lg:items-start">
    <SettingsNav />

    <section class="rounded-jj-card bg-jj-bg-card p-6 shadow-jj-card">
      <h1 class="text-lg font-semibold text-jj-text-1">个人资料</h1>
      <p class="mt-1 text-sm text-jj-text-3">修改后将在全站即时生效</p>

      <form class="mt-6 flex flex-col gap-5" @submit.prevent="handleSubmit">
        <label class="flex flex-col gap-1.5">
          <span class="text-sm text-jj-text-2">昵称</span>
          <input
            v-model="form.nickname"
            type="text"
            :maxlength="NICKNAME_MAX_LENGTH"
            placeholder="请输入昵称"
            class="h-10 w-full rounded bg-jj-bg-input px-3 text-sm text-jj-text-1 outline-none placeholder:text-jj-text-3 focus:ring-1 focus:ring-jj-primary"
          >
        </label>

        <label class="flex flex-col gap-1.5">
          <span class="text-sm text-jj-text-2">头像地址</span>
          <div class="flex items-center gap-3">
            <BaseAvatar :src="form.avatar" :size="40" />
            <input
              v-model="form.avatar"
              type="text"
              placeholder="粘贴图片地址，留空则显示默认头像"
              class="h-10 w-full flex-1 rounded bg-jj-bg-input px-3 text-sm text-jj-text-1 outline-none placeholder:text-jj-text-3 focus:ring-1 focus:ring-jj-primary"
            >
          </div>
        </label>

        <div class="grid gap-5 sm:grid-cols-2">
          <label class="flex flex-col gap-1.5">
            <span class="text-sm text-jj-text-2">职位</span>
            <input
              v-model="form.job"
              type="text"
              placeholder="如：前端工程师"
              class="h-10 w-full rounded bg-jj-bg-input px-3 text-sm text-jj-text-1 outline-none placeholder:text-jj-text-3 focus:ring-1 focus:ring-jj-primary"
            >
          </label>

          <label class="flex flex-col gap-1.5">
            <span class="text-sm text-jj-text-2">公司</span>
            <input
              v-model="form.company"
              type="text"
              placeholder="如：某互联网大厂"
              class="h-10 w-full rounded bg-jj-bg-input px-3 text-sm text-jj-text-1 outline-none placeholder:text-jj-text-3 focus:ring-1 focus:ring-jj-primary"
            >
          </label>
        </div>

        <label class="flex flex-col gap-1.5">
          <span class="flex items-center justify-between">
            <span class="text-sm text-jj-text-2">个人简介</span>
            <span class="text-xs text-jj-text-3">
              {{ form.description.length }} / {{ USER_DESCRIPTION_MAX_LENGTH }}
            </span>
          </span>
          <textarea
            v-model="form.description"
            rows="3"
            :maxlength="USER_DESCRIPTION_MAX_LENGTH"
            placeholder="一句话介绍自己"
            class="w-full resize-y rounded bg-jj-bg-input px-3 py-2 text-sm leading-relaxed text-jj-text-1 outline-none placeholder:text-jj-text-3 focus:ring-1 focus:ring-jj-primary"
          />
        </label>

        <label class="flex flex-col gap-1.5">
          <span class="text-sm text-jj-text-2">邮箱</span>
          <input
            v-model="form.email"
            type="email"
            placeholder="用于接收通知，可选"
            class="h-10 w-full rounded bg-jj-bg-input px-3 text-sm text-jj-text-1 outline-none placeholder:text-jj-text-3 focus:ring-1 focus:ring-jj-primary"
          >
        </label>

        <div class="flex justify-end border-t border-jj-border pt-4">
          <BaseButton size="lg" native-type="submit" :loading="saving">保存修改</BaseButton>
        </div>
      </form>
    </section>
  </div>
</template>
