import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMinutes < 1) return 'только что'
  if (diffMinutes < 60) return `${diffMinutes}м`
  if (diffHours < 24) return `${diffHours}ч`
  if (diffDays < 7) return `${diffDays}д`
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

export function formatBattleTime(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })
}
