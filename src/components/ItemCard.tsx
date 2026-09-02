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
    <div className="flex items-start justify-between gap-4 rounded-xl border border-black/5 bg-paper-50/60 px-5 py-4 transition-colors duration-150 dark:border-white/[0.06] dark:bg-ink-950/60">
      <div className="min-w-0 flex-1">{children}</div>
      {isOwner && (
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            aria-label="Edit"
            className="rounded-full border border-black/10 bg-transparent p-2 text-gray-500 transition hover:bg-black/5 hover:text-indigo-600 dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-indigo-400"
          >
            <EditIcon />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete"
            className="rounded-full border border-black/10 bg-transparent p-2 text-gray-500 transition hover:bg-black/5 hover:text-red-500 dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-red-400"
          >
            <TrashIcon />
          </button>
        </div>
      )}
    </div>
  )
}
