<script setup lang="ts">
definePageMeta({ layout: 'article' })

const route = useRoute()
const id = computed(() => String(route.params.id))

const { book, status } = await useBookDetail(id)

const notFound = computed(
  () => status.value === 'error' || (!book.value && status.value !== 'pending'),
)

usePageSeo({
  title: () => (book.value ? `${book.value.title} - 小册 - 掘金` : '小册详情 - 掘金'),
  description: () => book.value?.description ?? '掘金小册详情',
})
</script>

<template>
  <div class="mx-auto w-full max-w-4xl">
    <div v-if="notFound" class="rounded-jj-card bg-jj-bg-card py-12 shadow-jj-card">
      <BaseEmpty icon="i-lucide:book-open" description="小册不存在或已下架">
        <BaseButton class="mt-2" variant="secondary" @click="navigateTo('/books')">
          返回小册列表
        </BaseButton>
      </BaseEmpty>
    </div>

    <div v-else-if="!book" class="rounded-jj-card bg-jj-bg-card p-6 shadow-jj-card">
      <BaseSkeleton :height="160" />
    </div>

    <template v-else>
      <section class="rounded-jj-card bg-jj-bg-card p-6 shadow-jj-card">
        <div class="flex flex-col gap-5 sm:flex-row">
          <img
            v-if="book.cover"
            :src="book.cover"
            :alt="book.title"
            class="h-52 w-40 shrink-0 rounded object-cover"
          >

          <div class="min-w-0 flex-1">
            <h1 class="text-xl font-semibold text-jj-text-1">{{ book.title }}</h1>
            <p class="mt-3 text-sm leading-6 text-jj-text-2">{{ book.description }}</p>

            <div class="mt-3 flex flex-wrap gap-2">
              <BaseTag v-for="tag in book.tags" :key="tag" tone="default">#{{ tag }}</BaseTag>
            </div>

            <div class="mt-4 flex items-center gap-3">
              <BaseAvatar :src="book.author.avatar" :size="36" />
              <div class="min-w-0">
                <p class="truncate text-sm text-jj-text-1">{{ book.author.nickname }}</p>
                <p class="truncate text-xs text-jj-text-3">{{ book.author.description }}</p>
              </div>
            </div>

            <div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-jj-text-3">
              <span>{{ book.sectionCount }} 节</span>
              <span>{{ formatCount(book.learnerCount) }} 人学习</span>
              <span>{{ formatCount(book.collectCount) }} 人收藏</span>
              <BaseTag v-if="book.finished" tone="success">已完更</BaseTag>
            </div>
          </div>

          <div class="shrink-0 sm:w-40">
            <p class="text-2xl font-semibold text-jj-primary">{{ formatPrice(book.price) }}</p>
            <BaseButton class="mt-3" block>立即购买</BaseButton>
            <BaseButton class="mt-2" variant="secondary" block>收藏</BaseButton>
          </div>
        </div>
      </section>

      <section class="mt-4 rounded-jj-card bg-jj-bg-card shadow-jj-card">
        <h2 class="border-b border-jj-border px-6 py-3 text-sm font-medium text-jj-text-1">目录</h2>
        <ul class="divide-y divide-jj-border">
          <li
            v-for="(section, index) in book.sections"
            :key="section.id"
            class="flex items-center gap-3 px-6 py-3"
          >
            <span class="w-6 shrink-0 text-center text-xs text-jj-text-3">{{ index + 1 }}</span>
            <p class="min-w-0 flex-1 truncate text-sm text-jj-text-2">{{ section.title }}</p>
            <BaseTag v-if="section.free" tone="primary">免费</BaseTag>
            <span class="shrink-0 text-xs text-jj-text-3">{{ formatCount(section.viewCount) }}</span>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>
