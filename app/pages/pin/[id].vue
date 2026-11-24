<script setup lang="ts">
definePageMeta({ layout: 'article' })

const route = useRoute()
const id = computed(() => String(route.params.id))

const {
  pin,
  status,
  liked,
  likeCount,
  commentCount,
  toggleLike,
  comments,
  loadingComments,
  commentsHasMore,
  submitComment,
  loadMoreComments,
  loginRequired,
} = await usePinDetail(id)

const { loginWithDemo } = useAuth()

const notFound = computed(
  () => status.value === 'error' || (!pin.value && status.value !== 'pending'),
)

useSeoMeta({
  title: () => (pin.value ? `沸点 - ${pin.value.author.nickname} - 掘金` : '沸点详情 - 掘金'),
  description: () => pin.value?.content.slice(0, 80) ?? '掘金技术社区 · 沸点详情页',
})

/* ---------- 评论 ---------- */
const commentDraft = ref('')
const submittingComment = ref(false)

async function handleCommentSubmit() {
  submittingComment.value = true
  try {
    const success = await submitComment(commentDraft.value)
    if (success) commentDraft.value = ''
  } finally {
    submittingComment.value = false
  }
}

function scrollToComments() {
  document.getElementById('pin-comments')?.scrollIntoView({ behavior: 'smooth' })
}

/* ---------- 分享 ---------- */
const shareTips = ref('')

async function handleShare() {
  try {
    if (import.meta.client) {
      await navigator.clipboard.writeText(window.location.href)
    }
  } catch {
    // 剪贴板不可用时静默降级，仅提示文案
  }
  shareTips.value = '链接已复制'
  setTimeout(() => {
    shareTips.value = ''
  }, 2000)
}

/* ---------- 占位登录（阶段 5 替换为真实登录） ---------- */
async function handleDemoLogin() {
  await loginWithDemo()
  loginRequired.value = false
}
</script>

<template>
  <div class="mx-auto w-full max-w-3xl">
    <div v-if="notFound" class="rounded-jj-card bg-jj-bg-card py-12 shadow-jj-card">
      <BaseEmpty icon="i-lucide:message-square" description="沸点不存在或已被删除">
        <BaseButton class="mt-2" variant="secondary" @click="navigateTo('/pins')">返回沸点</BaseButton>
      </BaseEmpty>
    </div>

    <div v-else-if="!pin" class="rounded-jj-card bg-jj-bg-card p-6 shadow-jj-card">
      <BaseSkeleton :height="20" width="40%" />
      <BaseSkeleton class="mt-4" :height="16" />
      <BaseSkeleton class="mt-2" :height="16" width="80%" />
    </div>

    <template v-else>
      <article class="rounded-jj-card bg-jj-bg-card px-6 py-5 shadow-jj-card">
        <div class="flex items-center gap-3">
          <BaseAvatar :src="pin.author.avatar" :size="40" />
          <div class="min-w-0 flex-1">
            <p class="text-sm text-jj-text-1">{{ pin.author.nickname }}</p>
            <p class="mt-0.5 text-xs text-jj-text-3">{{ formatRelativeTime(pin.createdAt) }}</p>
          </div>
          <BaseButton variant="secondary" size="sm">关注</BaseButton>
        </div>

        <p class="mt-4 text-base leading-7 whitespace-pre-line text-jj-text-1">{{ pin.content }}</p>

        <div v-if="pin.images.length" class="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <img
            v-for="(image, index) in pin.images"
            :key="index"
            :src="image"
            :alt="`${pin.author.nickname} 的沸点配图`"
            class="aspect-[4/3] w-full rounded object-cover"
            loading="lazy"
          >
        </div>

        <div
          v-if="pin.topics.length"
          class="mt-4 flex flex-wrap items-center gap-2 text-xs text-jj-text-3"
        >
          <span
            v-for="topic in pin.topics"
            :key="topic"
            class="rounded bg-jj-bg-input px-1.5 py-0.5"
          >
            #{{ topic }}
          </span>
        </div>

        <div class="mt-6 border-t border-jj-border pt-4">
          <PinActions
            :liked="liked"
            :like-count="likeCount"
            :comment-count="commentCount"
            :tips="shareTips"
            @like="toggleLike"
            @comment="scrollToComments"
            @share="handleShare"
          />
        </div>
      </article>

      <section id="pin-comments" class="mt-4 rounded-jj-card bg-jj-bg-card px-6 py-5 shadow-jj-card">
        <CommentEditor
          v-model="commentDraft"
          :submitting="submittingComment"
          @submit="handleCommentSubmit"
        />
        <div class="mt-5">
          <CommentList
            :comments="comments"
            :loading="loadingComments"
            :has-more="commentsHasMore"
            @load="loadMoreComments"
          />
        </div>
      </section>
    </template>

    <BaseModal v-model="loginRequired" title="登录后即可操作" :width="360">
      <p class="text-sm text-jj-text-2">
        点赞与评论需要登录，当前为演示环境，可直接一键登录。
      </p>
      <template #footer>
        <BaseButton variant="secondary" @click="loginRequired = false">取消</BaseButton>
        <BaseButton @click="handleDemoLogin">一键演示登录</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
