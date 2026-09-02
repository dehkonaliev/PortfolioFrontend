import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'
import { Button, Field, Input } from '../components/ui'

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
    <div className="mx-auto flex min-h-[75vh] max-w-md items-center px-4 py-16">
      <div className="w-full">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xl font-bold text-white shadow-lg">
              P
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome back</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
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
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full py-2.5" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-gray-500 dark:text-gray-400">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  )
}

function extractError(err: unknown): string {
  const e = err as {
    response?: { data?: { data?: Record<string, unknown>; message?: string } }
    message?: string
  }
  const d = e.response?.data?.data as Record<string, unknown> | undefined
  if (d) {
    for (const val of Object.values(d)) {
      if (Array.isArray(val)) return String(val[0])
      return String(val)
    }
  }
  return e.response?.data?.message || e.message || 'Login failed'
}