import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

/** 项目根目录（去掉末尾斜杠，避免别名拼接出双斜杠） */
const rootDir = fileURLToPath(new URL('.', import.meta.url)).replace(/\/$/, '')

/** 与 Nuxt 别名保持一致：`~~` 指向项目根，`~` 指向 app/ */
export default defineConfig({
  resolve: {
    alias: {
      '~~': rootDir,
      '@@': rootDir,
      '~': `${rootDir}/app`,
      '@': `${rootDir}/app`,
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
})
