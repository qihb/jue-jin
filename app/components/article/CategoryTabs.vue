<script setup lang="ts">
import { SORT_TABS } from '~~/shared/constants'

const model = defineModel<string>({ required: true })

const items = SORT_TABS.map((tab) => ({ label: tab.name, value: tab.id }))
</script>

<template>
  <BaseTabs v-model="model" :items="items" />
</template>
