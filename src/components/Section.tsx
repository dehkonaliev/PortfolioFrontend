import type { ReactNode } from 'react'
import { PlusIcon } from './icons'

interface SectionProps {
  title: string
  icon: ReactNode
  isOwner: boolean
  onAdd: () => void
  children: ReactNode
}

export default function Section({ title, icon, isOwner, onAdd, children }: SectionProps) {
  return (
    <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-surface-raised)] text-[var(--text-tertiary)]">
            {icon}
          </span>
          <h2 className="text-base font-semibold text-[var(--text-primary)]">{title}</h2>
        </div>
        {isOwner && (
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-[13px] font-semibold text-[#0a0a0b] transition hover:opacity-90 active:scale-[0.98]"
          >
            <PlusIcon className="h-3.5 w-3.5" />
            Add
          </button>
        )}
      </div>
      <div className="p-6">
        {children}
      </div>
    </section>
  )
}
