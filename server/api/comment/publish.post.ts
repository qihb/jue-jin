import type { ApiResp, Comment, CommentTargetType } from '~~/shared/types'
import { MOCK_BASE_TIME } from '~~/shared/constants'
import { db, toUserBrief } from '~~/server/mock/seed'
import { fail, ok } from '~~/server/utils/resp'

/** 新增评论的自增序号（进程内递增即可，避免与 seed 的 id 冲突） */
let commentSeq = 0

/** 发表评论：写入内存 mock 库并同步目标的评论数 */
export default defineEventHandler(async (event): Promise<ApiResp<Comment>> => {
  const body = await readBody<{ targetType?: string; targetId?: string; content?: string } | undefined>(
    event,
  )
  const content = body?.content?.trim() ?? ''
  if (!content) {
    return fail('评论内容不能为空', 400)
  }

  const targetType: CommentTargetType = body?.targetType === 'pin' ? 'pin' : 'article'
  const targetId = body?.targetId ?? ''
  // 阶段 4 占位当前用户，阶段 5 改为按 token 解析
  const [author] = db.users
  if (!author) {
    return fail('用户不存在', 404)
  }

  commentSeq += 1
  const comment: Comment = {
    id: `comment_new_${commentSeq}`,
    targetType,
    targetId,
    content,
    author: toUserBrief(author),
    replyTo: null,
    replyToName: '',
    likeCount: 0,
    liked: false,
    // 与 mock 时间基准对齐，保证与其余数据同样的相对时间口径
    createdAt: new Date(MOCK_BASE_TIME).toISOString(),
    children: [],
  }
  db.comments.unshift(comment)

  const target =
    targetType === 'article'
      ? db.articles.find((item) => item.id === targetId)
      : db.pins.find((item) => item.id === targetId)
  if (target) {
    target.commentCount += 1
  }

  return ok(comment)
})
