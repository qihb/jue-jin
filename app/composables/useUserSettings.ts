import type { User, UserProfile } from '~~/shared/types'

/**
 * 个人设置：读取完整资料、编辑表单与保存。
 * 保存成功后把最新的昵称 / 头像同步回登录态，头部与抽屉即时更新。
 * 页面由 `middleware/auth` 保证已登录。
 */
export async function useUserSettings() {
  const { user } = useAuth()
  const id = computed(() => user.value?.id ?? '')

  const { data: profile, status } = await useAsyncData(`user-settings:${id.value}`, () =>
    request<UserProfile>(`/api/user/${id.value}`),
  )

  const form = reactive({
    nickname: '',
    avatar: '',
    job: '',
    company: '',
    description: '',
    email: '',
  })

  watch(
    profile,
    (value) => {
      if (!value) return
      form.nickname = value.nickname
      form.avatar = value.avatar
      form.job = value.job
      form.company = value.company
      form.description = value.description
      form.email = value.email
    },
    { immediate: true },
  )

  const saving = ref(false)

  async function saveProfile(): Promise<boolean> {
    if (saving.value) return false
    saving.value = true
    try {
      const updated = await request<User>('/api/user/profile', {
        method: 'POST',
        body: {
          nickname: form.nickname,
          avatar: form.avatar,
          job: form.job,
          company: form.company,
          description: form.description,
          email: form.email,
        },
      })
      user.value = updated
      return true
    } finally {
      saving.value = false
    }
  }

  return { profile, status, form, saving, saveProfile }
}
