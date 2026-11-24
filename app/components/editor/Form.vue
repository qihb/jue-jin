<script setup lang="ts">
import { CONTENT_CATEGORIES } from '~~/shared/constants'
import { TITLE_MAX_LENGTH, type EditorInitialValue } from '~/composables/useEditor'

interface Props {
  /** 初始表单值；编辑草稿时传入草稿内容与 draftId */
  initial?: EditorInitialValue
}

const props = defineProps<Props>()

const auth = useAuth()
const {
  title,
  content,
  brief,
  cover,
  categoryId,
  tags,
  wordCount,
  canPublish,
  savedAt,
  saveNow,
  publishing,
  publish,
  loginRequired,
} = useEditor(props.initial ?? {})

const publishVisible = ref(false)

/** 点「发布」：未登录先唤起演示登录弹窗，已登录直接打开发布设置 */
function openPublish() {
  if (!auth.isLoggedIn.value) {
    loginRequired.value = true
    return
  }
  publishVisible.value = true
}

async function handleConfirmPublish() {
  const id = await publish()
  if (!id) return
  publishVisible.value = false
  await navigateTo(`/article/${id}`)
}

async function handleDemoLogin() {
  await auth.loginWithDemo()
  loginRequired.value = false
  publishVisible.value = true
}

function openDrafts() {
  navigateTo('/editor/drafts')
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <EditorTitleBar
      v-model="title"
      :title-max="TITLE_MAX_LENGTH"
      :word-count="wordCount"
      :saved-at="savedAt"
      :can-publish="canPublish"
      :publishing="publishing"
      @save="saveNow"
      @publish="openPublish"
      @open-drafts="openDrafts"
    />

    <EditorWorkspace v-model="content" />

    <BaseModal v-model="publishVisible" title="发布文章" :width="520">
      <EditorPublishPanel
        v-model:category-id="categoryId"
        v-model:cover="cover"
        v-model:brief="brief"
        v-model:tags="tags"
        :categories="CONTENT_CATEGORIES"
      />
      <template #footer>
        <BaseButton variant="secondary" @click="publishVisible = false">取消</BaseButton>
        <BaseButton :loading="publishing" @click="handleConfirmPublish">确认发布</BaseButton>
      </template>
    </BaseModal>

    <BaseModal v-model="loginRequired" title="登录后即可发布" :width="360">
      <p class="text-sm text-jj-text-2">
        发布文章需要登录，当前为演示环境，可直接一键登录后继续。
      </p>
      <template #footer>
        <BaseButton variant="secondary" @click="loginRequired = false">取消</BaseButton>
        <BaseButton @click="handleDemoLogin">一键演示登录</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
