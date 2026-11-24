<script setup lang="ts">
import { FEED_CATEGORIES } from '~~/shared/constants'

const model = defineModel<string>({ required: true })

const items = FEED_CATEGORIES.map((category) => ({ label: category.name, value: category.id }))
</script>

<template>
  <BaseTabs v-model="model" :items="items" />
</template>
