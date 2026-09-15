import type { ReactNode } from 'react'
import { PlusIcon } from './icons'

interface SectionProps {
  title: string
  icon: ReactNode
  isOwner: boolean
  onAdd: () => void
  children: ReactNode
  extraActions?: ReactNode
}

export default function Section({ title, icon, isOwner, onAdd, children, extraActions }: SectionProps) {
  return (
    <section className="panel-card reveal overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--bg-surface-raised)] text-[var(--text-tertiary)]">
            {icon}
          </span>
          <h2 className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">{title}</h2>
        </div>
        {isOwner && (
          <div className="print:hidden flex items-center gap-2">
            {extraActions}
            <button
              onClick={onAdd}
              className="btn-tactile btn-primary inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-semibold text-white transition"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              Add
            </button>
          </div>
        )}
      </div>
      <div className="p-6">
        {children}
      </div>
    </section>
  )
}
