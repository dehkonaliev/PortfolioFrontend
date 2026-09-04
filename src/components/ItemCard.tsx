import type { ReactNode } from 'react'
import { EditIcon, TrashIcon } from './icons'

interface ItemCardProps {
  isOwner: boolean
  onEdit: () => void
  onDelete: () => void
  children: ReactNode
}

export default function ItemCard({ isOwner, onEdit, onDelete, children }: ItemCardProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-5 py-4 transition-colors hover:border-[var(--border-strong)]">
      <div className="min-w-0 flex-1">{children}</div>
      {isOwner && (
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            aria-label="Edit"
            className="rounded-lg p-1.5 text-[var(--text-tertiary)] transition hover:bg-[var(--bg-surface-raised)] hover:text-[var(--text-primary)]"
          >
            <EditIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete"
            className="rounded-lg p-1.5 text-[var(--text-tertiary)] transition hover:bg-[var(--bg-surface-raised)] hover:text-red-500"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
