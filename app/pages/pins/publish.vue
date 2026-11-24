<script setup lang="ts">
import type { PinPublishPayload } from '~~/shared/types'

definePageMeta({ middleware: 'auth' })

const { publishing, publish } = usePinPublish()

function handleSubmit(payload: PinPublishPayload) {
  void publish(payload)
}

usePageSeo({
  title: '发布沸点 - 掘金',
  description: '分享你的开发日常、技术心得与想法。',
})
</script>

<template>
  <div class="mx-auto w-full max-w-2xl py-2">
    <section class="rounded-jj-card bg-jj-bg-card p-6 shadow-jj-card">
      <h1 class="text-lg font-semibold text-jj-text-1">发布沸点</h1>
      <p class="mt-1 text-sm text-jj-text-3">分享你的开发日常、技术心得或想法</p>
      <PinPublishForm class="mt-6" :loading="publishing" @submit="handleSubmit" />
    </section>
  </div>
</template>
