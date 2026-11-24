import type {
  ArticleDetail,
  ArticleSummary,
  AuthorRankItem,
  Comment,
  CommentTargetType,
  ID,
  PinDetail,
  Tag,
  User,
  UserBrief,
} from '~~/shared/types'
import { CONTENT_CATEGORIES, MOCK_BASE_TIME } from '~~/shared/constants'

/**
 * 固定随机种子：保证每次启动生成完全一致的 mock 数据，
 * 从而让 SSR 输出与 CSR 重新请求的结果一致（避免 hydration mismatch）。
 */
const RANDOM_SEED = 20261124

/** 数据规模 */
const USER_COUNT = 30
const ARTICLE_COUNT = 120
const PIN_COUNT = 60
const COMMENT_COUNT = 200

type Rng = () => number
type ImageSize = 'square' | 'landscape_4_3'

/** mulberry32：轻量确定性伪随机数发生器 */
function createRng(seed: number): Rng {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rng = createRng(RANDOM_SEED)

/** 取 [min, max] 闭区间整数 */
function int(min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1))
}

/** 从数据池中确定性取一项（仅用于非空池） */
function pick<T>(list: readonly T[]): T {
  const item = list[int(0, list.length - 1)]
  if (item === undefined) {
    throw new Error('pick(): 数据池不能为空')
  }
  return item
}

/** 基于基准时间的相对时间（offsetMinutes 为负表示过去） */
function isoTime(offsetMinutes: number): string {
  return new Date(MOCK_BASE_TIME + offsetMinutes * 60_000).toISOString()
}

/** 生成图片地址（统一走平台文生图接口，禁止外部占位图） */
function imageUrl(prompt: string, size: ImageSize): string {
  return `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    prompt,
  )}&image_size=${size}`
}

/* ============================== 词库 ============================== */

const NICKNAME_PREFIX = [
  '不安分的',
  '沉默的',
  '深海的',
  '追光的',
  '爱写代码的',
  '会飞的小',
  '像素级',
  '秃头',
  '努力搬砖的',
  '摸鱼',
] as const

const NICKNAME_CORE = [
  '前端',
  '后端',
  '全栈',
  '算法',
  '架构',
  '测试',
  '运维',
  '数据',
  'AI',
  '产品',
] as const

const NICKNAME_SUFFIX = [
  '喵',
  '酱',
  '君',
  '同学',
  '小王',
  '阿飞',
  '老张',
  '菜鸟',
  '大神',
  '扛把子',
] as const

const USER_DESCRIPTIONS = [
  '专注前端工程化与性能优化',
  '热爱开源，喜欢折腾各种新技术',
  '后端搬砖多年，擅长高并发架构',
  '全栈开发，白天写业务晚上写博客',
  '算法工程师，关注大模型与推荐系统',
  '测试开发，让 bug 无处可逃',
  '喜欢用代码解决实际问题',
  '在成长的路上，做一个长期主义者',
] as const

const JOBS = [
  '前端工程师',
  '后端工程师',
  '全栈工程师',
  '架构师',
  '算法工程师',
  '测试工程师',
  '技术专家',
] as const

const COMPANIES = [
  '某互联网大厂',
  '某电商平台',
  '某金融科技',
  '某创业公司',
  '某云服务商',
  '自由职业',
] as const

const ARTICLE_TOPICS = [
  'Vue 3',
  'React',
  'TypeScript',
  'Node.js',
  'Vite',
  'Rust',
  'Go',
  'Kubernetes',
  'Redis',
  'MySQL',
  'Nginx',
  'Docker',
  '微前端',
  '低代码',
  '大模型应用',
  'WebAssembly',
  'Tailwind CSS',
  '性能优化',
] as const

const ARTICLE_TITLE_TEMPLATES = [
  '从 0 到 1 搭建 {topic} 项目实战',
  '深入理解 {topic} 的核心原理',
  '{topic} 性能优化实践总结',
  '我踩过的 {topic} 那些坑',
  '一文搞懂 {topic} 的常见误区',
  '{topic} 最佳实践指南',
  '为什么我最终选择了 {topic}',
  '{topic} 源码阅读笔记',
  '用 {topic} 重构之后的几点思考',
  '{topic} 在大型项目中的落地经验',
] as const

const ARTICLE_BRIEFS = [
  '本文记录了一次完整的技术选型与落地过程，包含方案对比、遇到的问题以及最终结论。',
  '最近在项目中遇到了一个棘手的问题，排查了两天终于找到根因，分享出来避免大家重复踩坑。',
  '结合实战经验梳理了这套方案的核心思路，并给出了可直接复用的代码示例。',
  '很多人对这块的理解停留在表面，本文从原理出发，把常见的误区一次性讲清楚。',
  '这篇文章不给你标准答案，而是提供一个思考框架，帮你在不同场景下做出判断。',
  '从需求分析到代码落地，完整还原了这次重构的全过程，附最小可运行示例。',
] as const

const ARTICLE_PARAGRAPHS = [
  '在开始之前我们先明确目标：把复杂问题拆成可验证的小步骤，逐步推进。',
  '实际落地时最先暴露的往往不是技术难点，而是边界条件与协作成本。',
  '这里有个容易被忽略的细节：默认配置在多数场景够用，但数据量上来后就会成为瓶颈。',
  '建议先写一个最小可运行示例，确认核心链路通畅之后，再逐步叠加业务逻辑。',
  '从性能数据看，优化后首屏时间下降了约 40%，最关键的一步其实是减少不必要的重渲染。',
  '最后提醒一句：任何方案都有适用边界，脱离业务场景谈最佳实践都是耍流氓。',
] as const

const PIN_CONTENTS = [
  '今天终于把困扰一周的内存泄漏问题解决了，用 memgraph 定位到是事件监听没解绑，记录一下。',
  '分享一个编辑器小技巧：按住 Option 拖动代码块可以快速复制，效率直接翻倍。',
  '早起的第 30 天，状态比想象中好，继续打卡。',
  '重构完成，代码量减少 30%，可读性提升明显，值得。',
  '面试被问到浏览器从输入 URL 到页面渲染的完整流程，整理了一份回答思路。',
  '刚上线一个用 Tailwind 写的后台，开发体验真的回不去了。',
  '有没有推荐的分布式链路追踪方案？我们在用 Jaeger，采样率调高之后开销有点大。',
  '深夜加班结束，提醒自己：身体才是最重要的。',
] as const

const COMMENT_TEXTS = [
  '写得太好了，学到了！',
  '收藏了，感谢分享～',
  '这个点我踩过坑，深有体会。',
  '请问有完整示例代码吗？',
  '讲得很清楚，赞一个。',
  '正好在做类似需求，帮大忙了。',
  '这块和我们的线上方案不太一样，能展开说说吗？',
  '已三连，期待后续更新。',
  '关注了，希望多一些这类实战内容。',
  '看完了，感觉还可以再深挖一层。',
] as const

const REPLY_TEXTS = [
  '感谢支持！',
  '是的，这块确实容易踩坑。',
  '示例代码已经放到仓库里了。',
  '后面会单独写一篇展开讲讲。',
] as const

/** 标签种子：name 同时作为文章标签名与沸点话题名 */
const TAG_SEEDS: readonly { name: string; icon: string; categoryId: string }[] = [
  { name: '前端', icon: 'i-lucide:layout-template', categoryId: 'frontend' },
  { name: 'Vue 3', icon: 'i-lucide:component', categoryId: 'frontend' },
  { name: 'React', icon: 'i-lucide:atom', categoryId: 'frontend' },
  { name: 'TypeScript', icon: 'i-lucide:file-code', categoryId: 'frontend' },
  { name: 'Tailwind CSS', icon: 'i-lucide:palette', categoryId: 'frontend' },
  { name: 'Node.js', icon: 'i-lucide:server', categoryId: 'backend' },
  { name: 'Go', icon: 'i-lucide:binary', categoryId: 'backend' },
  { name: 'Rust', icon: 'i-lucide:cog', categoryId: 'backend' },
  { name: 'Redis', icon: 'i-lucide:database', categoryId: 'backend' },
  { name: 'MySQL', icon: 'i-lucide:database', categoryId: 'backend' },
  { name: 'Kubernetes', icon: 'i-lucide:boxes', categoryId: 'tools' },
  { name: 'Docker', icon: 'i-lucide:container', categoryId: 'tools' },
  { name: 'Nginx', icon: 'i-lucide:network', categoryId: 'tools' },
  { name: 'Vite', icon: 'i-lucide:zap', categoryId: 'tools' },
  { name: '大模型', icon: 'i-lucide:brain', categoryId: 'ai' },
  { name: '算法', icon: 'i-lucide:sigma', categoryId: 'ai' },
]

const TAG_NAMES: readonly string[] = TAG_SEEDS.map((tag) => tag.name)

/* ============================== 生成器 ============================== */

function toUserBrief(user: User): UserBrief {
  const { id, username, nickname, avatar, level, description } = user
  return { id, username, nickname, avatar, level, description }
}

function generateUsers(count: number): User[] {
  const users: User[] = []
  for (let index = 0; index < count; index += 1) {
    const seq = index + 1
    users.push({
      id: `user_${seq}`,
      username: `juejin_${seq}`,
      nickname: `${pick(NICKNAME_PREFIX)}${pick(NICKNAME_CORE)}${pick(NICKNAME_SUFFIX)}`,
      avatar: imageUrl(`扁平矢量技术风格开发者头像，配色方案 ${seq}`, 'square'),
      level: int(1, 8),
      description: pick(USER_DESCRIPTIONS),
      email: `juejin_${seq}@example.com`,
      job: pick(JOBS),
      company: pick(COMPANIES),
      power: int(200, 20000),
      followCount: int(5, 300),
      followerCount: int(10, 5000),
      likedCount: int(20, 30000),
      articleCount: 0,
      createdAt: isoTime(-(seq * 1440 + int(0, 1440))),
    })
  }
  return users
}

function buildContent(title: string, topic: string): string {
  const first = pick(ARTICLE_PARAGRAPHS)
  const second = pick(ARTICLE_PARAGRAPHS)
  const third = pick(ARTICLE_PARAGRAPHS)
  return [
    `# ${title}`,
    '',
    first,
    '',
    `## 为什么选择 ${topic}`,
    '',
    second,
    '',
    '```ts',
    `// ${topic} 最小示例`,
    'export function main() {',
    `  return '${topic}'`,
    '}',
    '```',
    '',
    '## 落地实践',
    '',
    third,
    '',
    '> 以上代码仅为演示，实际项目请结合业务调整。',
  ].join('\n')
}

function generateArticles(count: number, users: User[]): ArticleDetail[] {
  const articles: ArticleDetail[] = []
  for (let index = 0; index < count; index += 1) {
    const seq = index + 1
    const topic = pick(ARTICLE_TOPICS)
    const title = pick(ARTICLE_TITLE_TEMPLATES).replace('{topic}', topic)

    const topicTag = TAG_SEEDS.find((tag) => tag.name === topic)
    const categoryId = topicTag ? topicTag.categoryId : pick(CONTENT_CATEGORIES).id
    const sameCategory = TAG_SEEDS.filter((tag) => tag.categoryId === categoryId)
    const primaryTag = pick(sameCategory.length > 0 ? sameCategory : TAG_SEEDS).name
    const secondaryTag = pick(TAG_SEEDS).name
    const tags = primaryTag === secondaryTag ? [primaryTag] : [primaryTag, secondaryTag]

    const hasCover = rng() < 0.5

    articles.push({
      id: `article_${seq}`,
      title,
      brief: pick(ARTICLE_BRIEFS),
      cover: hasCover
        ? imageUrl(`${topic} 技术文章封面插画，蓝色科技感，编号 ${seq}`, 'landscape_4_3')
        : '',
      categoryId,
      tags,
      author: toUserBrief(pick(users)),
      viewCount: int(100, 50000),
      likeCount: int(5, 1200),
      commentCount: 0,
      collectCount: int(1, 800),
      createdAt: isoTime(-(index * 137 + int(0, 120))),
      isHot: rng() < 0.2,
      content: buildContent(title, topic),
      liked: rng() < 0.3,
      collected: rng() < 0.2,
    })
  }
  return articles
}

function generatePins(count: number, users: User[]): PinDetail[] {
  const pins: PinDetail[] = []
  for (let index = 0; index < count; index += 1) {
    const seq = index + 1
    const hasImage = rng() < 0.4
    pins.push({
      id: `pin_${seq}`,
      content: pick(PIN_CONTENTS),
      images: hasImage ? [imageUrl(`开发者日常配图，简洁风格，编号 ${seq}`, 'landscape_4_3')] : [],
      topics: [pick(TAG_NAMES)],
      author: toUserBrief(pick(users)),
      likeCount: int(0, 500),
      commentCount: 0,
      createdAt: isoTime(-(index * 91 + int(0, 60))),
      liked: rng() < 0.25,
    })
  }
  return pins
}

function generateComments(
  count: number,
  users: User[],
  articles: ArticleDetail[],
  pins: PinDetail[],
): Comment[] {
  const comments: Comment[] = []
  for (let index = 0; index < count; index += 1) {
    const seq = index + 1
    const onArticle = rng() < 0.7
    const targetType: CommentTargetType = onArticle ? 'article' : 'pin'
    const targetId: ID = onArticle ? pick(articles).id : pick(pins).id
    const author = pick(users)

    const children: Comment[] = []
    const replyCount = rng() < 0.35 ? int(1, 2) : 0
    for (let reply = 0; reply < replyCount; reply += 1) {
      children.push({
        id: `comment_${seq}_${reply + 1}`,
        targetType,
        targetId,
        content: pick(REPLY_TEXTS),
        author: toUserBrief(pick(users)),
        replyTo: `comment_${seq}`,
        replyToName: author.nickname,
        likeCount: int(0, 50),
        liked: false,
        createdAt: isoTime(-(index * 37 + reply + 1)),
        children: [],
      })
    }

    comments.push({
      id: `comment_${seq}`,
      targetType,
      targetId,
      content: pick(COMMENT_TEXTS),
      author: toUserBrief(author),
      replyTo: null,
      replyToName: '',
      likeCount: int(0, 200),
      liked: rng() < 0.2,
      createdAt: isoTime(-(index * 37 + int(0, 36))),
      children,
    })
  }
  return comments
}

function generateTags(articles: ArticleDetail[]): Tag[] {
  return TAG_SEEDS.map((seed, index) => ({
    id: `tag_${index + 1}`,
    name: seed.name,
    icon: seed.icon,
    categoryId: seed.categoryId,
    description: `${seed.name} 相关的技术文章与讨论`,
    articleCount: articles.filter((article) => article.tags.includes(seed.name)).length,
    followerCount: int(100, 20000),
  }))
}

function generateAuthorRank(users: User[]): AuthorRankItem[] {
  return users
    .toSorted((a, b) => b.power - a.power)
    .slice(0, 10)
    .map((user, index) => ({
      rank: index + 1,
      user: toUserBrief(user),
      power: user.power,
      trend: int(0, 500),
    }))
}

/* ============================== 组装 ============================== */

const users = generateUsers(USER_COUNT)
const articles = generateArticles(ARTICLE_COUNT, users)
const pins = generatePins(PIN_COUNT, users)
const comments = generateComments(COMMENT_COUNT, users, articles, pins)
const tags = generateTags(articles)
const authorRank = generateAuthorRank(users)

// 回填统计字段：作者发文数、内容评论数
for (const article of articles) {
  const author = users.find((user) => user.id === article.author.id)
  if (author) {
    author.articleCount += 1
  }
}

const commentCountByTarget = new Map<ID, number>()
for (const comment of comments) {
  const total = 1 + comment.children.length
  commentCountByTarget.set(
    comment.targetId,
    (commentCountByTarget.get(comment.targetId) ?? 0) + total,
  )
}
for (const article of articles) {
  article.commentCount = commentCountByTarget.get(article.id) ?? 0
}
for (const pin of pins) {
  pin.commentCount = commentCountByTarget.get(pin.id) ?? 0
}

/** mock 数据库：整站接口的唯一数据来源 */
export interface MockDatabase {
  users: User[]
  articles: ArticleDetail[]
  pins: PinDetail[]
  comments: Comment[]
  tags: Tag[]
  authorRank: AuthorRankItem[]
}

export const db: MockDatabase = { users, articles, pins, comments, tags, authorRank }

/** 文章详情 → 列表项（剥离正文与登录态） */
export function toArticleSummary(article: ArticleDetail): ArticleSummary {
  return {
    id: article.id,
    title: article.title,
    brief: article.brief,
    cover: article.cover,
    categoryId: article.categoryId,
    tags: article.tags,
    author: article.author,
    viewCount: article.viewCount,
    likeCount: article.likeCount,
    commentCount: article.commentCount,
    collectCount: article.collectCount,
    createdAt: article.createdAt,
    isHot: article.isHot,
  }
}
