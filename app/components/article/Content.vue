<script setup lang="ts">
const props = defineProps<{ html: string }>()
</script>

<template>
  <!-- 正文 HTML 由 markdown-it 生成（html:false，原文已转义），非用户直传 -->
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div class="jj-markdown" v-html="props.html" />
</template>
