<script setup lang="ts">
interface Props {
  /** 空状态说明文案 */
  description?: string
  /** Iconify 图标名 */
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  description: '登录后即可查看',
  icon: 'i-lucide:log-in',
})

const { loginWithDemo } = useAuth()

const loading = ref(false)

/**
 * 一键演示登录。登录态变化由调用方 `watch(isLoggedIn)` 感知，
 * 不能在此处 emit：登录成功后父级会立即卸载本组件，emit 将被丢弃。
 */
async function handleLogin() {
  if (loading.value) return
  loading.value = true
  try {
    await loginWithDemo()
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <BaseEmpty :icon="props.icon" :description="props.description">
    <BaseButton class="mt-2" :loading="loading" @click="handleLogin">一键演示登录</BaseButton>
  </BaseEmpty>
</template>
