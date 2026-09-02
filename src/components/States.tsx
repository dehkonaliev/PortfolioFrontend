import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function LoadingScreen({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-indigo-600 dark:border-gray-700 dark:border-t-indigo-500" />
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  )
}

export function NotFoundState({ message = 'Nothing here yet.' }: { message?: string }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <div className="text-center">
        <div className="text-5xl font-bold text-gray-300 dark:text-gray-700">404</div>
        <h1 className="mt-3 text-xl font-semibold text-gray-900 dark:text-gray-100">{message}</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">The page you're looking for doesn't exist.</p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
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
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white/50 px-6 py-12 text-center dark:border-gray-700 dark:bg-gray-900/40">
      {icon}
      <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      {subtitle && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}