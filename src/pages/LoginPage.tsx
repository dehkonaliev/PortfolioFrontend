import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'
import { Button, Field, Input } from '../components/ui'
import { extractError } from '../lib/errors'

export default function LoginPage() {
  usePageTitle('Sign in — YourResume')
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(username, password)
      navigate('/')
    } catch (err) {
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-sm items-center px-4 py-16">
      <div className="w-full">
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 shadow-[var(--shadow-card)]">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-semibold text-[var(--text-primary)]">Welcome back</h1>
            <p className="mt-1 text-sm text-[var(--text-tertiary)]">
              Sign in to manage your portfolio.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Username">
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                placeholder="your-username"
                required
              />
            </Field>
            <Field label="Password">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
                required
              />
            </Field>

            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full py-2.5" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-[var(--text-tertiary)]">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-[var(--accent)] hover:underline">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  )
}


