import type { ReactNode } from 'react'

interface SectionProps {
  title: string
  icon: ReactNode
  isOwner: boolean
  onAdd: () => void
  children: ReactNode
}

export default function Section({ title, icon, isOwner, onAdd, children }: SectionProps) {
  return (
    <section className="rounded-2xl border border-black/5 bg-white shadow-sm transition-colors duration-150 hover:border-black/10 dark:border-white/5 dark:bg-ink-900 dark:hover:border-white/10 dark:hover:bg-ink-800">
      <div className="flex items-center justify-between gap-3 border-b border-black/5 px-5 py-4 dark:border-white/5">
        <h2 className="flex items-center gap-3 text-base font-semibold text-gray-900 dark:text-white">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
            {icon}
          </span>
          {title}
        </h2>
        {isOwner && (
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-150 ease-out hover:bg-indigo-400 hover:shadow-[0_0_0_4px_rgba(212,168,83,0.15)] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-ink-900"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded bg-white/20">+</span>
            Add
          </button>
        )}
      </div>
      <div className="p-5">
        {children}
      </div>
    </section>
  )
}
