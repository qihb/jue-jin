import type {
  ArticleDetail,
  ArticleSummary,
  AuthorRankItem,
  BookDetail,
  BookSection,
  Comment,
  ID,
  NotificationItem,
  NotificationTab,
  NotificationTargetType,
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
type ImageSize = 'square' | 'landscape_4_3' | 'portrait_4_3'

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

/** 取 [min, max] 闭区间整数 */
function int(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1))
}

/** 从数据池中确定性取一项（仅用于非空池） */
function pick<T>(rng: Rng, list: readonly T[]): T {
  const item = list[int(rng, 0, list.length - 1)]
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

/** 小册种子：title 作为小册名，tags 复用 TAG_SEEDS 中的标签名（便于跳转标签页） */
const BOOK_SEEDS: readonly {
  title: string
  description: string
  tags: string[]
  /** 价格（单位：分），0 表示免费 */
  price: number
  finished: boolean
}[] = [
  {
    title: 'Vue 3 实战：从组件到工程化',
    description: '带你从基础组件一路走到大型项目工程化，覆盖组合式 API、状态管理与性能优化。',
    tags: ['Vue 3', '前端'],
    price: 2990,
    finished: true,
  },
  {
    title: 'React 进阶：Hooks 与状态管理',
    description: '系统梳理 Hooks 的心智模型，讲清状态管理选型与常见的性能陷阱。',
    tags: ['React'],
    price: 3490,
    finished: true,
  },
  {
    title: 'TypeScript 类型体操入门',
    description: '从泛型到条件类型，用真实业务场景练出扎实的类型设计能力。',
    tags: ['TypeScript'],
    price: 3990,
    finished: false,
  },
  {
    title: 'Node.js 服务端开发实战',
    description: '基于 Node.js 构建可维护的服务端应用，含鉴权、缓存与部署实践。',
    tags: ['Node.js'],
    price: 4590,
    finished: true,
  },
  {
    title: '深入 MySQL：索引与事务',
    description: '从 B+ 树到 MVCC，弄懂索引与事务背后的原理，写出更快的 SQL。',
    tags: ['MySQL'],
    price: 0,
    finished: true,
  },
  {
    title: 'Redis 实战：缓存与分布式锁',
    description: '缓存穿透、雪崩、击穿以及分布式锁的落地实现与踩坑总结。',
    tags: ['Redis'],
    price: 2590,
    finished: true,
  },
  {
    title: 'Kubernetes 入门到实践',
    description: '从最小可用集群到生产级部署，逐步掌握 K8s 的核心对象与运维技巧。',
    tags: ['Kubernetes', 'Docker'],
    price: 5990,
    finished: false,
  },
  {
    title: '大模型应用开发指南',
    description: '围绕 Prompt 工程、RAG 与 Agent，给出可落地的大模型应用架构方案。',
    tags: ['大模型'],
    price: 6990,
    finished: false,
  },
  {
    title: '前端性能优化实战',
    description: '从首屏加载到运行时流畅度，用真实数据驱动一次完整的性能优化。',
    tags: ['Vite', '前端'],
    price: 3290,
    finished: true,
  },
  {
    title: '算法与数据结构精讲',
    description: '用面试高频题串起常用数据结构与算法思想，构建解题的通用套路。',
    tags: ['算法'],
    price: 0,
    finished: true,
  },
]

/** 章节标题池（按序号循环取用） */
const BOOK_CHAPTER_TOPICS = [
  '基础概念与前置准备',
  '环境搭建与最小示例',
  '核心原理剖析',
  '实战演练',
  '常见问题与排查',
  '性能优化实践',
  '源码阅读笔记',
  '工程化与协作',
  '部署上线',
  '总结与展望',
] as const

/** 每位用户生成的消息条数 */
const NOTIFICATION_PER_USER = 16

/** 消息分类抽取池（重复项用于加权，让「赞和收藏」占比最高） */
const NOTIFICATION_TAB_POOL: readonly NotificationTab[] = [
  'like',
  'like',
  'like',
  'comment',
  'comment',
  'mention',
  'follow',
  'system',
]

/** 「赞和收藏」动作文案 */
const LIKE_TITLES = ['赞了你的文章', '收藏了你的文章'] as const

/** 系统通知标题池 */
const SYSTEM_TITLES = [
  '你的文章已通过审核',
  '获得「掘金月度优秀作者」',
  '账号安全提醒',
  '你关注的技术领域上新了小册',
  '掘金社区规范更新',
] as const

/** 系统通知正文池 */
const SYSTEM_CONTENTS = [
  '你发布的文章已通过审核，现已对外可见。',
  '感谢持续输出优质内容，本月创作者激励已发放至账户。',
  '检测到你的账号在新设备登录，如非本人操作请及时修改密码。',
  '你关注的技术领域有新小册上架，欢迎前往查看。',
  '为营造更好的技术交流氛围，社区规范已更新，请查阅详情。',
] as const

/** 收藏集名称池 */
const COLLECTION_NAMES = [
  '前端进阶必读',
  '源码阅读清单',
  '性能优化合集',
  '后端架构设计',
  'AI 与大模型',
  '工程化实践',
  '面试复习资料',
  '数据库与存储',
  '云原生运维',
  '我的技术成长',
] as const

/** 收藏集描述池 */
const COLLECTION_DESCRIPTIONS = [
  '收藏了一批质量不错的技术文章，持续更新中。',
  '都是精读过的干货，适合系统性地补一补基础。',
  '工作中遇到问题时翻出来看看，挺有用的。',
  '整理了一份学习路径，按顺序读效果更好。',
  '把喜欢的文章归档到这里，方便随时回看。',
] as const

/* ============================== 生成器 ============================== */

export function toUserBrief(user: User): UserBrief {
  const { id, username, nickname, avatar, level, description } = user
  return { id, username, nickname, avatar, level, description }
}

function generateUsers(rng: Rng, count: number): User[] {
  const users: User[] = []
  for (let index = 0; index < count; index += 1) {
    const seq = index + 1
    users.push({
      id: `user_${seq}`,
      username: `juejin_${seq}`,
      nickname: `${pick(rng, NICKNAME_PREFIX)}${pick(rng, NICKNAME_CORE)}${pick(rng, NICKNAME_SUFFIX)}`,
      avatar: imageUrl(`扁平矢量技术风格开发者头像，配色方案 ${seq}`, 'square'),
      level: int(rng, 1, 8),
      description: pick(rng, USER_DESCRIPTIONS),
      email: `juejin_${seq}@example.com`,
      job: pick(rng, JOBS),
      company: pick(rng, COMPANIES),
      power: int(rng, 200, 20000),
      followCount: int(rng, 5, 300),
      followerCount: int(rng, 10, 5000),
      likedCount: int(rng, 20, 30000),
      articleCount: 0,
      createdAt: isoTime(-(seq * 1440 + int(rng, 0, 1440))),
    })
  }
  return users
}

function buildContent(rng: Rng, title: string, topic: string): string {
  const first = pick(rng, ARTICLE_PARAGRAPHS)
  const second = pick(rng, ARTICLE_PARAGRAPHS)
  const third = pick(rng, ARTICLE_PARAGRAPHS)
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

function generateArticles(rng: Rng, count: number, users: User[]): ArticleDetail[] {
  const articles: ArticleDetail[] = []
  for (let index = 0; index < count; index += 1) {
    const seq = index + 1
    const topic = pick(rng, ARTICLE_TOPICS)
    const title = pick(rng, ARTICLE_TITLE_TEMPLATES).replace('{topic}', topic)

    const topicTag = TAG_SEEDS.find((tag) => tag.name === topic)
    const categoryId = topicTag ? topicTag.categoryId : pick(rng, CONTENT_CATEGORIES).id
    const sameCategory = TAG_SEEDS.filter((tag) => tag.categoryId === categoryId)
    const primaryTag = pick(rng, sameCategory.length > 0 ? sameCategory : TAG_SEEDS).name
    const secondaryTag = pick(rng, TAG_SEEDS).name
    const tags = primaryTag === secondaryTag ? [primaryTag] : [primaryTag, secondaryTag]

    const hasCover = rng() < 0.5

    articles.push({
      id: `article_${seq}`,
      title,
      brief: pick(rng, ARTICLE_BRIEFS),
      cover: hasCover
        ? imageUrl(`${topic} 技术文章封面插画，蓝色科技感，编号 ${seq}`, 'landscape_4_3')
        : '',
      categoryId,
      tags,
      author: toUserBrief(pick(rng, users)),
      viewCount: int(rng, 100, 50000),
      likeCount: int(rng, 5, 1200),
      commentCount: 0,
      collectCount: int(rng, 1, 800),
      createdAt: isoTime(-(index * 137 + int(rng, 0, 120))),
      isHot: rng() < 0.2,
      content: buildContent(rng, title, topic),
      // liked / collected 为「当前登录用户」的交互态，持久化层按用户关系表计算，种子不预设
      liked: false,
      collected: false,
    })
  }
  return articles
}

function generatePins(rng: Rng, count: number, users: User[]): PinDetail[] {
  const pins: PinDetail[] = []
  for (let index = 0; index < count; index += 1) {
    const seq = index + 1
    const hasImage = rng() < 0.4
    pins.push({
      id: `pin_${seq}`,
      content: pick(rng, PIN_CONTENTS),
      images: hasImage ? [imageUrl(`开发者日常配图，简洁风格，编号 ${seq}`, 'landscape_4_3')] : [],
      topics: [pick(rng, TAG_NAMES)],
      author: toUserBrief(pick(rng, users)),
      likeCount: int(rng, 0, 500),
      commentCount: 0,
      createdAt: isoTime(-(index * 91 + int(rng, 0, 60))),
      liked: false,
    })
  }
  return pins
}

function generateComments(
  rng: Rng,
  count: number,
  users: User[],
  articles: ArticleDetail[],
  pins: PinDetail[],
): Comment[] {
  const comments: Comment[] = []
  for (let index = 0; index < count; index += 1) {
    const seq = index + 1
    const onArticle = rng() < 0.7
    const targetType = onArticle ? 'article' : 'pin'
    const targetId: ID = onArticle ? pick(rng, articles).id : pick(rng, pins).id
    const author = pick(rng, users)

    const children: Comment[] = []
    const replyCount = rng() < 0.35 ? int(rng, 1, 2) : 0
    for (let reply = 0; reply < replyCount; reply += 1) {
      children.push({
        id: `comment_${seq}_${reply + 1}`,
        targetType,
        targetId,
        content: pick(rng, REPLY_TEXTS),
        author: toUserBrief(pick(rng, users)),
        replyTo: `comment_${seq}`,
        replyToName: author.nickname,
        likeCount: int(rng, 0, 50),
        liked: false,
        createdAt: isoTime(-(index * 37 + reply + 1)),
        children: [],
      })
    }

    comments.push({
      id: `comment_${seq}`,
      targetType,
      targetId,
      content: pick(rng, COMMENT_TEXTS),
      author: toUserBrief(author),
      replyTo: null,
      replyToName: '',
      likeCount: int(rng, 0, 200),
      liked: false,
      createdAt: isoTime(-(index * 37 + int(rng, 0, 36))),
      children,
    })
  }
  return comments
}

function generateTags(rng: Rng, articles: ArticleDetail[]): Tag[] {
  return TAG_SEEDS.map((seed, index) => ({
    id: `tag_${index + 1}`,
    name: seed.name,
    icon: seed.icon,
    categoryId: seed.categoryId,
    description: `${seed.name} 相关的技术文章与讨论`,
    articleCount: articles.filter((article) => article.tags.includes(seed.name)).length,
    followerCount: int(rng, 100, 20000),
  }))
}

function generateBooks(rng: Rng, users: User[]): BookDetail[] {
  return BOOK_SEEDS.map((seed, index) => {
    const id = `book_${index + 1}`
    const sectionCount = int(rng, 8, 16)
    const sections: BookSection[] = Array.from({ length: sectionCount }, (_, chapter) => ({
      id: `${id}_s${chapter + 1}`,
      title: `第 ${chapter + 1} 章 ${BOOK_CHAPTER_TOPICS[chapter % BOOK_CHAPTER_TOPICS.length] ?? '实战'}`,
      free: chapter < 3,
      viewCount: int(rng, 100, 20000),
    }))

    return {
      id,
      title: seed.title,
      cover: imageUrl(`${seed.title} 技术小册封面，扁平插画风，编号 ${index + 1}`, 'portrait_4_3'),
      description: seed.description,
      author: toUserBrief(pick(rng, users)),
      tags: seed.tags,
      price: seed.price,
      finished: seed.finished,
      sectionCount,
      learnerCount: int(rng, 200, 80000),
      collectCount: int(rng, 100, 30000),
      createdAt: isoTime(-(index * 2880 + int(rng, 0, 1440))),
      sections,
    }
  })
}

function generateAuthorRank(users: User[]): AuthorRankItem[] {
  const rng = createRng(RANDOM_SEED + 999)
  return users
    .toSorted((a, b) => b.power - a.power)
    .slice(0, 10)
    .map((user, index) => ({
      rank: index + 1,
      user: toUserBrief(user),
      power: user.power,
      trend: int(rng, 0, 500),
    }))
}

/** 消息记录：在 `NotificationItem` 基础上带上收件人（写入 notifications.user_id） */
export interface NotificationRecord extends NotificationItem {
  userId: ID
}

/** 收藏集记录：带上归属用户与收录文章（分别写入 collections / collection_articles） */
export interface CollectionRecord {
  id: ID
  userId: ID
  name: string
  description: string
  cover: string
  createdAt: string
  updatedAt: string
  articleIds: ID[]
}

/**
 * 生成消息通知：每位用户各生成一批，触发者从其他用户中抽取。
 * 赞 / 评论 / @ 优先指向收件人自己的文章，保证文案与内容归属一致。
 */
function generateNotifications(
  rng: Rng,
  users: User[],
  articles: ArticleDetail[],
  pins: PinDetail[],
): NotificationRecord[] {
  const records: NotificationRecord[] = []
  let seq = 0

  for (const recipient of users) {
    const ownArticles = articles.filter((article) => article.author.id === recipient.id)
    const actorPool = users.filter((user) => user.id !== recipient.id)

    for (let index = 0; index < NOTIFICATION_PER_USER; index += 1) {
      seq += 1
      const tab = pick(rng, NOTIFICATION_TAB_POOL)
      const actor = toUserBrief(pick(rng, actorPool))

      let targetType: NotificationTargetType = 'none'
      let targetId: ID = ''
      let title: string
      let content = ''

      if (tab === 'system') {
        title = pick(rng, SYSTEM_TITLES)
        content = pick(rng, SYSTEM_CONTENTS)
      } else if (tab === 'follow') {
        title = '关注了你'
      } else {
        // 指向文章（优先收件人自己的文章）或沸点
        if (rng() < 0.75) {
          const article = pick(rng, ownArticles.length > 0 ? ownArticles : articles)
          targetType = 'article'
          targetId = article.id
          if (tab === 'like') {
            title = `${pick(rng, LIKE_TITLES)}《${article.title}》`
          } else if (tab === 'comment') {
            title = `评论了你的文章《${article.title}》`
          } else {
            title = `在文章《${article.title}》中提到了你`
          }
        } else {
          const pin = pick(rng, pins)
          targetType = 'pin'
          targetId = pin.id
          if (tab === 'like') {
            title = '赞了你的沸点'
          } else if (tab === 'comment') {
            title = '评论了你的沸点'
          } else {
            title = '在沸点中提到了你'
          }
        }

        if (tab === 'comment') {
          content = pick(rng, COMMENT_TEXTS)
        } else if (tab === 'mention') {
          content = `@${recipient.nickname} ${pick(rng, COMMENT_TEXTS)}`
        }
      }

      records.push({
        id: `notification_${seq}`,
        userId: recipient.id,
        tab,
        actor: tab === 'system' ? null : actor,
        title,
        content,
        targetType,
        targetId,
        read: rng() < 0.45,
        createdAt: isoTime(-(index * 173 + int(rng, 0, 90))),
      })
    }
  }

  return records
}

/** 生成收藏集：每位用户若干本，每本去重收录一批文章 */
function generateCollections(
  rng: Rng,
  users: User[],
  articles: ArticleDetail[],
): CollectionRecord[] {
  const records: CollectionRecord[] = []
  let seq = 0

  for (const user of users) {
    const count = int(rng, 3, 5)
    const namePool: string[] = [...COLLECTION_NAMES]

    for (let index = 0; index < count; index += 1) {
      seq += 1
      const nameIndex = int(rng, 0, namePool.length - 1)
      const name = namePool.splice(nameIndex, 1)[0] ?? '我的收藏'

      const used = new Set<ID>()
      const expected = int(rng, 6, 18)
      const articleIds: ID[] = []
      while (articleIds.length < expected && articleIds.length < articles.length) {
        const article = pick(rng, articles)
        if (used.has(article.id)) continue
        used.add(article.id)
        articleIds.push(article.id)
      }

      // 偏移量为分钟（负值表示过去）：updatedAt 晚于 createdAt
      const createdOffset = -(index * 2160 + int(rng, 1000, 6000))

      records.push({
        id: `collection_${seq}`,
        userId: user.id,
        name,
        description: pick(rng, COLLECTION_DESCRIPTIONS),
        cover: imageUrl(`${name} 收藏集封面，扁平插画风，编号 ${seq}`, 'landscape_4_3'),
        createdAt: isoTime(createdOffset),
        updatedAt: isoTime(createdOffset + int(rng, 60, 1000)),
        articleIds,
      })
    }
  }

  return records
}

/* ============================== 组装 ============================== */

/** mock 数据生成结果（供 SQLite 持久化层灌入） */
export interface MockData {
  users: User[]
  articles: ArticleDetail[]
  pins: PinDetail[]
  comments: Comment[]
  tags: Tag[]
  books: BookDetail[]
  notifications: NotificationRecord[]
  collections: CollectionRecord[]
  authorRank: AuthorRankItem[]
}

/**
 * 生成确定性 mock 数据。
 * 每次调用结果完全一致（固定随机种子），保证 SSR 与 CSR 渲染一致。
 */
export function generateMockData(): MockData {
  const rng = createRng(RANDOM_SEED)

  const users = generateUsers(rng, USER_COUNT)
  const articles = generateArticles(rng, ARTICLE_COUNT, users)
  const pins = generatePins(rng, PIN_COUNT, users)
  const comments = generateComments(rng, COMMENT_COUNT, users, articles, pins)
  const tags = generateTags(rng, articles)
  const books = generateBooks(rng, users)
  const notifications = generateNotifications(rng, users, articles, pins)
  const collections = generateCollections(rng, users, articles)

  // 回填统计字段：作者发文数、内容评论数
  for (const article of articles) {
    const author = users.find((user) => user.id === article.author.id)
    if (author) author.articleCount += 1
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

  const authorRank = generateAuthorRank(users)

  return { users, articles, pins, comments, tags, books, notifications, collections, authorRank }
}

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
