import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import css from 'highlight.js/lib/languages/css'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import MarkdownIt from 'markdown-it'

/** 文章目录项 */
export interface ArticleTocItem {
  /** 锚点 id，与正文标题一一对应 */
  id: string
  /** 标题文本 */
  text: string
  /** 标题层级（正文目录仅收录 2 / 3 级） */
  level: number
}

export interface RenderedMarkdown {
  html: string
  toc: ArticleTocItem[]
}

hljs.registerLanguage('bash', bash)
hljs.registerLanguage('css', css)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('json', json)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('xml', xml)

const HTML_ESCAPE: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPE[char] ?? char)
}

/** 生成锚点 id：保留中英文与数字，空格转连字符 */
function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
}

/** 单次渲染的中间态（挂在 markdown-it 的 env 上，避免跨请求串数据） */
interface MarkdownEnv {
  [key: string | symbol]: unknown
  toc: ArticleTocItem[]
  slugCount: Map<string, number>
}

const markdown = new MarkdownIt({
  // 关闭内联 HTML：正文一律转义，渲染结果只由 markdown 语法决定
  html: false,
  linkify: true,
  highlight(code, language) {
    const lang = language && hljs.getLanguage(language) ? language : ''
    const inner = lang
      ? hljs.highlight(code, { language: lang, ignoreIllegals: true }).value
      : escapeHtml(code)
    return `<pre class="hljs"><code class="language-${lang || 'text'}">${inner}</code></pre>`
  },
})

// 为标题写入锚点 id，同时收集目录（2 / 3 级）
markdown.renderer.rules.heading_open = (tokens, idx, options, env, renderer) => {
  const token = tokens[idx]
  const inline = tokens[idx + 1]
  if (!token || !inline || inline.type !== 'inline') {
    return renderer.renderToken(tokens, idx, options)
  }

  const state = env as unknown as MarkdownEnv
  const level = Number.parseInt(token.tag.slice(1), 10)
  const text = inline.content
  const base = slugify(text) || `section-${state.toc.length + 1}`
  const seen = state.slugCount.get(base) ?? 0
  state.slugCount.set(base, seen + 1)

  const id = seen === 0 ? base : `${base}-${seen}`
  token.attrSet('id', id)
  if (level >= 2) {
    state.toc.push({ id, text, level })
  }
  return renderer.renderToken(tokens, idx, options)
}

/** 渲染文章正文：返回 HTML 与目录，SSR / CSR 输入一致则输出一致 */
export function renderMarkdown(source: string): RenderedMarkdown {
  const env: MarkdownEnv = { toc: [], slugCount: new Map() }
  const html = markdown.render(source, env)
  return { html, toc: env.toc }
}
