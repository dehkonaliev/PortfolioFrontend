import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function LoadingScreen({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[var(--border-subtle)] border-t-[var(--accent)]" />
        <p className="mt-3 text-sm text-[var(--text-tertiary)]">{label}</p>
      </div>
    </div>
  )
}

export function NotFoundState({ message = 'Nothing here yet.' }: { message?: string }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <div className="text-center">
        <div className="text-4xl font-bold text-[var(--border-strong)]">404</div>
        <h1 className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{message}</h1>
        <p className="mt-1 text-sm text-[var(--text-tertiary)]">The page you're looking for doesn't exist.</p>
        <Link
          to="/"
          className="mt-5 inline-block rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[#0a0a0b] transition hover:opacity-90"
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}

export function EmptyState({ icon, title, subtitle, action }: {
  icon: ReactNode
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-surface-raised)]/50 px-6 py-12 text-center">
      <div className="text-[var(--text-tertiary)]">{icon}</div>
      <h3 className="mt-3 text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
      {subtitle && <p className="mt-1 text-sm text-[var(--text-tertiary)]">{subtitle}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}
