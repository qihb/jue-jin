<script setup lang="ts">
definePageMeta({ layout: 'article' })

const route = useRoute()
const id = computed(() => String(route.params.id))

const {
  article,
  status,
  html,
  toc,
  author,
  recommend,
  liked,
  collected,
  likeCount,
  collectCount,
  commentCount,
  toggleLike,
  toggleCollect,
  comments,
  loadingComments,
  commentsHasMore,
  submitComment,
  loadMoreComments,
  loginRequired,
} = await useArticleDetail(id)

const { user, loginWithDemo } = useAuth()

const notFound = computed(
  () => status.value === 'error' || (!article.value && status.value !== 'pending'),
)

usePageSeo({
  title: () => (article.value ? `${article.value.title} - 掘金` : '文章详情 - 掘金'),
  description: () => article.value?.brief ?? '掘金技术社区 · 文章详情页',
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
  document.getElementById('article-comments')?.scrollIntoView({ behavior: 'smooth' })
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
  <div>
    <div v-if="notFound" class="rounded-jj-card bg-jj-bg-card py-12 shadow-jj-card">
      <BaseEmpty icon="i-lucide:file-question" description="文章不存在或已被删除">
        <BaseButton class="mt-2" variant="secondary" @click="navigateTo('/')">返回首页</BaseButton>
      </BaseEmpty>
    </div>

    <div v-else-if="!article" class="rounded-jj-card bg-jj-bg-card p-6 shadow-jj-card">
      <BaseSkeleton :height="28" width="60%" />
      <BaseSkeleton class="mt-4" :height="16" />
      <BaseSkeleton class="mt-2" :height="16" />
      <BaseSkeleton class="mt-2" :height="16" width="80%" />
    </div>

    <div v-else class="flex gap-4">
      <article class="min-w-0 flex-1">
        <div class="rounded-jj-card bg-jj-bg-card px-4 py-5 shadow-jj-card sm:px-6">
          <div class="flex items-center gap-3">
            <BaseAvatar :src="article.author.avatar" :size="40" />
            <div class="min-w-0 flex-1">
              <p class="text-sm text-jj-text-1">{{ article.author.nickname }}</p>
              <ArticleMeta :article="article" class="mt-0.5" />
            </div>
            <UserFollowButton
              v-if="article.author.id !== user?.id"
              :user-id="article.author.id"
              :initial="article.following"
            />
          </div>

          <h1 class="mt-5 text-xl leading-8 font-bold text-jj-text-1 sm:text-2xl sm:leading-9">
            {{ article.title }}
          </h1>

          <ArticleContent :html="html" class="mt-5" />

          <div class="mt-6 border-t border-jj-border pt-4">
            <ArticleActions
              :liked="liked"
              :collected="collected"
              :like-count="likeCount"
              :collect-count="collectCount"
              :comment-count="commentCount"
              :tips="shareTips"
              @like="toggleLike"
              @collect="toggleCollect"
              @comment="scrollToComments"
              @share="handleShare"
            />
          </div>
        </div>

        <section
          id="article-comments"
          class="mt-4 rounded-jj-card bg-jj-bg-card px-4 py-5 shadow-jj-card sm:px-6"
        >
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

        <ArticleRecommend :articles="recommend" class="mt-4" />
      </article>

      <aside class="flex w-64 shrink-0 flex-col gap-4 max-lg:hidden">
        <ArticleAuthorCard v-if="author" :author="author" :following="article.following" />
        <ArticleToc :items="toc" />
      </aside>
    </div>

    <BaseModal v-model="loginRequired" title="登录后即可操作" :width="360">
      <p class="text-sm text-jj-text-2">
        点赞、收藏与评论需要登录，当前为演示环境，可直接一键登录。
      </p>
      <template #footer>
        <BaseButton variant="secondary" @click="loginRequired = false">取消</BaseButton>
        <BaseButton @click="handleDemoLogin">一键演示登录</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
