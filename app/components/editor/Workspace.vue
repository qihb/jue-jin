<script setup lang="ts">
import type { Component } from 'vue'
import * as bytemdVue from '@bytemd/vue-next'
import gfm from '@bytemd/plugin-gfm'
import highlight from '@bytemd/plugin-highlight'
import type { BytemdLocale } from 'bytemd'

/**
 * `@bytemd/vue-next` 的 d.ts 把组件导出声明成了类型（`DefineComponent`），
 * 无法作为值直接导入；这里按实际运行时导出取回组件引用后再渲染。
 */
const Editor = (bytemdVue as unknown as { Editor: Component }).Editor

const content = defineModel<string>({ required: true })

/** 插件实例保持稳定引用，避免每次渲染重建编辑器 */
const plugins = [gfm(), highlight()]

/** 中文界面：bytemd 未随包提供 locale 文件，内联一份精简覆盖 */
const locale: Partial<BytemdLocale> = {
  write: '编辑',
  preview: '预览',
  writeOnly: '仅编辑',
  exitWriteOnly: '退出仅编辑',
  previewOnly: '仅预览',
  exitPreviewOnly: '退出仅预览',
  help: '帮助',
  closeHelp: '关闭帮助',
  toc: '目录',
  closeToc: '关闭目录',
  fullscreen: '全屏',
  exitFullscreen: '退出全屏',
  source: '源码',
  words: '字数',
  lines: '行数',
  sync: '同步滚动',
  h1: '一级标题',
  h2: '二级标题',
  h3: '三级标题',
  h4: '四级标题',
  h5: '五级标题',
  h6: '六级标题',
  bold: '加粗',
  italic: '斜体',
  quote: '引用',
  link: '链接',
  image: '图片',
  code: '行内代码',
  codeBlock: '代码块',
  ul: '无序列表',
  ol: '有序列表',
  hr: '分割线',
}

function handleChange(next: string) {
  content.value = next
}
</script>

<template>
  <div class="jj-editor">
    <ClientOnly>
      <Editor
        :value="content"
        :plugins="plugins"
        :locale="locale"
        mode="auto"
        placeholder="请输入正文，支持 Markdown 语法…"
        @change="handleChange"
      />
      <template #fallback>
        <div
          class="h-[calc(100vh-264px)] min-h-[480px] rounded-jj-card border border-jj-border bg-jj-bg-card p-4"
        >
          <BaseSkeleton :height="16" width="40%" />
          <BaseSkeleton class="mt-3" :height="16" />
          <BaseSkeleton class="mt-2" :height="16" width="82%" />
          <BaseSkeleton class="mt-2" :height="16" width="64%" />
        </div>
      </template>
    </ClientOnly>
  </div>
</template>
