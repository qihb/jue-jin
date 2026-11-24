import { describe, expect, it } from 'vitest'
import { renderMarkdown } from '~/utils/markdown'

describe('renderMarkdown', () => {
  it('为标题写入锚点 id 并只收集 2 / 3 级目录', () => {
    const { html, toc } = renderMarkdown('# 标题\n\n## 二级标题\n\n### 三级标题\n')

    expect(html).toContain('id="标题"')
    expect(toc).toEqual([
      { id: '二级标题', text: '二级标题', level: 2 },
      { id: '三级标题', text: '三级标题', level: 3 },
    ])
  })

  it('重复标题追加序号，避免锚点冲突', () => {
    const { toc } = renderMarkdown('## 同名\n\n## 同名\n')
    expect(toc.map((item) => item.id)).toEqual(['同名', '同名-1'])
  })

  it('英文标题转小写并把空格转连字符', () => {
    const { toc } = renderMarkdown('## Hello World\n')
    expect(toc[0]?.id).toBe('hello-world')
  })

  it('关闭内联 HTML：正文标签被转义', () => {
    const { html } = renderMarkdown('<div>hi</div>\n')
    expect(html).toContain('&lt;div&gt;')
    expect(html).not.toContain('<div>')
  })

  it('代码块按语言高亮', () => {
    const { html } = renderMarkdown('```ts\nconst a = 1\n```\n')
    expect(html).toContain('hljs')
    expect(html).toContain('class="language-ts"')
  })
})
