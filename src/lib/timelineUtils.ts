export type TimelineEntry = { from_date?: string | null; to_date?: string | null }

export function isOngoing(item: { to_date?: string | null }): boolean {
  return !item.to_date || item.to_date === null || item.to_date === ''
}

export function parseDateRange(from_date?: string | null, to_date?: string | null): { from: Date | null; to: Date | null } {
  const f = from_date ? new Date(from_date) : null
  const t = to_date ? new Date(to_date) : null
  return { from: Number.isNaN(f?.getTime()) ? null : f, to: Number.isNaN(t?.getTime()) ? null : t }
}

export function formatMonthYear(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export function rangeText(from_date?: string | null, to_date?: string | null): { label: string; ongoing: boolean } {
  const { from, to } = parseDateRange(from_date, to_date)
  const ongoing = isOngoing({ to_date })
  const fromLabel = from ? formatMonthYear(from) : ''
  const toLabel = ongoing ? '' : to ? formatMonthYear(to) : ''
  const label = [fromLabel, ongoing ? '' : toLabel].filter(Boolean).join(' — ')
  return { label: label || (ongoing ? 'Present' : ''), ongoing }
}

export function durationMonths(from_date?: string | null, to_date?: string | null): number {
  const { from, to } = parseDateRange(from_date, to_date)
  if (!from) return 0
  const end = to || new Date()
  let months = (end.getFullYear() - from.getFullYear()) * 12 + (end.getMonth() - from.getMonth())
  if (end.getDate() < from.getDate()) months -= 1
  return Math.max(0, months)
}

export function durationLabel(from_date?: string | null, to_date?: string | null): string {
  const months = durationMonths(from_date, to_date)
  if (months <= 0) return ''
  const years = Math.floor(months / 12)
  const rest = months % 12
  const parts = []
  if (years > 0) parts.push(`${years}y`)
  if (rest > 0) parts.push(`${rest}mo`)
  return parts.join(' ') || `${months}mo`
}

export function sortByStartDesc<T extends TimelineEntry>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const aTime = a.from_date ? new Date(a.from_date).getTime() : 0
    const bTime = b.from_date ? new Date(b.from_date).getTime() : 0
    return bTime - aTime
  })
}

export function activeIndex(items: TimelineEntry[]): number {
  const now = new Date()
  let best = -1
  let bestEnd = Infinity
  items.forEach((it, i) => {
    const end = it.to_date ? new Date(it.to_date).getTime() : Infinity
    if (end >= now.getTime() && end < bestEnd) {
      bestEnd = end
      best = i
    }
  })
  return best
}
