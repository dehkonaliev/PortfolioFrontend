import { QuoteIcon, StarIcon, TrashIcon } from './icons'
import type { Endorsement } from '../types'

interface EndorsementCardProps {
  endorsement: Endorsement
  canDelete?: boolean
  onDelete?: () => void
}

export default function EndorsementCard({ endorsement, canDelete, onDelete }: EndorsementCardProps) {
  return (
    <figure className="flex flex-col gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] p-5">
      <div className="flex items-center justify-between">
        <QuoteIcon className="h-5 w-5 text-[var(--accent)]" />
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <StarIcon key={i} className="h-3.5 w-3.5 fill-[var(--accent)] text-[var(--accent)]" />
            ))}
          </div>
          {canDelete && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              title="Remove recommendation"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-tertiary)] transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
            >
              <TrashIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
      <blockquote className="text-sm leading-relaxed text-[var(--text-secondary)]">
        “{endorsement.text}”
      </blockquote>
      <figcaption className="mt-auto border-t border-[var(--border-subtle)] pt-3">
        <p className="text-sm font-semibold text-[var(--text-primary)]">{endorsement.author_name}</p>
        {endorsement.author_title && (
          <p className="text-xs text-[var(--text-tertiary)]">{endorsement.author_title}</p>
        )}
      </figcaption>
    </figure>
  )
}