import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none transition focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20 ${className}`}
      {...props}
    />
  )
}

export function Textarea({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none transition focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20 ${className}`}
      {...props}
    />
  )
}

export function Field({ label, children, error }: { label: string; children: ReactNode; error?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-[var(--text-tertiary)]">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </label>
  )
}

export function Select({ children, className = '', ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20 ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}

export function Button({
  children,
  variant = 'primary',
  type = 'button',
  className = '',
  ...props
}: {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger'
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60'
  const variants: Record<string, string> = {
    primary:
      'bg-[var(--accent)] text-[#0a0a0b] hover:opacity-90 focus:ring-[var(--accent)]',
    outline:
      'border border-[var(--border-subtle)] bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-surface-raised)] hover:text-[var(--text-primary)] focus:ring-[var(--border-strong)]',
    ghost:
      'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-raised)] hover:text-[var(--text-primary)]',
    danger:
      'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  }
  return (
    <button type={type} className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
