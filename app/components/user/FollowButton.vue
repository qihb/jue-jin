<script setup lang="ts">
import type { ID } from '~~/shared/types'

interface Props {
  /** 目标用户 id */
  userId: ID
  /** 初始关注态（来自详情数据 / 搜索结果） */
  initial?: boolean
}

const props = withDefaults(defineProps<Props>(), { initial: false })

const { loginWithDemo } = useAuth()
const { following, loading, loginRequired, toggle } = useFollow(() => props.userId, {
  initial: () => props.initial,
})
</script>

<template>
  <div>
    <BaseButton
      size="sm"
      :variant="following ? 'secondary' : 'primary'"
      :loading="loading"
      @click="toggle"
    >
      {{ following ? '已关注' : '关注' }}
    </BaseButton>

    <BaseModal v-model="loginRequired" title="登录后即可关注" :width="360">
      <p class="text-sm text-jj-text-2">关注作者需要登录，当前为演示环境，可直接一键登录。</p>
      <template #footer>
        <BaseButton variant="secondary" @click="loginRequired = false">取消</BaseButton>
        <BaseButton @click="loginWithDemo">一键演示登录</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
