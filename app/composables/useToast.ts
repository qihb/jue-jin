export type ToastType = 'error' | 'success'

export interface ToastItem {
  id: number
  message: string
  type: ToastType
}

/**
 * 全局轻提示队列。
 * 仅在客户端弹窗：SSR 阶段直接跳过，避免把某次请求的提示写进共享状态、串到其他请求。
 */
const toasts = ref<ToastItem[]>([])
let seq = 0

export function dismissToast(id: number) {
  toasts.value = toasts.value.filter((item) => item.id !== id)
}

export function pushToast(message: string, type: ToastType = 'error', duration = 3000) {
  if (import.meta.server || !message) return
  const id = (seq += 1)
  toasts.value = [...toasts.value, { id, message, type }]
  setTimeout(() => dismissToast(id), duration)
}

/** 组合式入口：组件读取队列并渲染 */
export function useToast() {
  return { toasts, pushToast, dismissToast }
}
