import {
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { EditIcon, TrashIcon } from './icons'
import {
  sortByStartDesc,
  activeIndex,
  type TimelineEntry,
} from '../lib/timelineUtils'

interface TimelineListProps<T extends TimelineEntry> {
  items: T[]
  emptyLabel?: string
  children: (entry: { item: T; itemIndex: number; active: boolean }) => ReactNode
}

export function TimelineList<T extends TimelineEntry>({ items, emptyLabel, children }: TimelineListProps<T>) {
  const list = useMemo(() => sortByStartDesc(items), [items])

  if (list.length === 0) {
    return (
      <div className="relative pl-5 sm:pl-9">
        <span className="absolute bottom-0 left-[5px] top-0 w-px bg-[var(--border-subtle)] sm:left-[13px]" />
        {emptyLabel ? (
          <p className="py-2 text-center text-sm text-[var(--text-tertiary)]">{emptyLabel}</p>
        ) : null}
      </div>
    )
  }

  const active = activeIndex(list)

  return (
    <div className="space-y-5 sm:space-y-[28px]">
      {list.map((item, itemIndex) => {
        const isActive = itemIndex === active
        const isLast = itemIndex === list.length - 1
        return (
          <div key={itemIndex} className="relative pl-5 sm:pl-9">
            {!isLast && (
              <span className="pointer-events-none absolute bottom-[-20px] left-[5px] top-0 w-px bg-[var(--border-subtle)] sm:bottom-[-28px] sm:left-[13px]" />
            )}
            <span
              className={`pointer-events-none absolute left-0 top-1 h-[10px] w-[10px] rounded-full transition-transform duration-150 group-hover:scale-110 sm:left-[8px] ${
                isActive
                  ? 'bg-[var(--accent)] ring-2 ring-[var(--accent-soft)]'
                  : 'bg-[var(--bg-canvas)] ring-2 ring-[var(--border-strong)]'
              }`}
            />
            {children({ item, itemIndex, active: isActive })}
          </div>
        )
      })}
    </div>
  )
}

export function TimelineItem({
  title,
  subtitle,
  meta,
  description,
  onEdit,
  onDelete,
  canEdit,
  children,
}: {
  title: ReactNode
  subtitle?: ReactNode
  meta?: ReactNode
  description?: ReactNode
  onEdit?: () => void
  onDelete?: () => void
  canEdit?: boolean
  children?: ReactNode
}) {
  return (
    <div className="relative group rounded-lg transition-colors duration-150 hover:bg-[var(--bg-surface-raised)] sm:-mx-2 sm:px-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="flex flex-wrap items-baseline gap-x-1.5 pr-9 text-[15px] font-semibold text-[var(--text-primary)]">
            {title}
            {subtitle && (
              <>
                <span className="text-[var(--text-tertiary)]">·</span>
                <span className="font-normal text-[var(--text-secondary)]">{subtitle}</span>
              </>
            )}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            {meta && <div className="min-w-0">{meta}</div>}
          </div>
          {description && <div className="mt-1.5 max-w-[65ch]">{description}</div>}
          {children}
        </div>
      </div>
      {/* Actions: top-right corner */}
      <div className="flex shrink-0 items-center gap-0.5">
        {(onEdit || onDelete) && canEdit && (
          <div className="absolute right-0 top-0 flex items-center gap-0.5 opacity-0 transition-opacity duration-150 focus-within:opacity-100 group-hover:opacity-100 max-sm:opacity-100">
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                aria-label="Edit"
                className="rounded-lg p-1 text-[var(--text-tertiary)] transition hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]"
              >
                <EditIcon className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                aria-label="Delete"
                className="rounded-lg p-1 text-[var(--text-tertiary)] transition hover:bg-[var(--bg-surface)] hover:text-red-500"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function TimelineDescription({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)
  if (!text) return null
  const lines = text.split('\n').filter(Boolean)
  const isLong = lines.length > 3
  const shown = isLong && !expanded ? lines.slice(0, 3) : lines
  return (
    <div>
      {shown.map((line, i) => (
        <p key={i} className="text-[13px] leading-relaxed text-[var(--text-secondary)]">
          {line}
        </p>
      ))}
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-0.5 text-xs font-medium text-[var(--accent)] hover:underline"
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  )
}
