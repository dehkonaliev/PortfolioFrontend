import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth, type SignupData } from '../context/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'
import { Field, Input, Button } from '../components/ui'

type Step = 1 | 2 | 3

export default function SignupPage() {
  usePageTitle('Sign up — YourResume')
  const { requestVerification, verifyCode, signup } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>(1)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [verificationToken, setVerificationToken] = useState('')
  const [form, setForm] = useState({
    username: '',
    first_name: '',
    last_name: '',
    password: '',
    conf_password: '',
  })

  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const set = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)
    try {
      const msg = await requestVerification(email)
      setMessage(msg)
      setStep(2)
    } catch (err) {
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const token = await verifyCode(email, code)
      setVerificationToken(token)
      setStep(3)
    } catch (err) {
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const payload: SignupData = {
      email,
      code,
      verificationToken,
      username: form.username,
      first_name: form.first_name,
      last_name: form.last_name,
      password: form.password,
      conf_password: form.conf_password,
    }
    try {
      await signup(payload)
      navigate('/')
    } catch (err) {
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { n: 1, label: 'Email' },
    { n: 2, label: 'Verify' },
    { n: 3, label: 'Details' },
  ]

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-md items-center px-4 py-16">
      <div className="w-full">
        {/* Stepper */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {steps.map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition ${
                  step >= s.n
                    ? 'bg-indigo-600 text-white'
                    : 'border-2 border-gray-300 text-gray-400 dark:border-gray-600 dark:text-gray-500'
                }`}
              >
                {s.n}
              </div>
              <span
                className={`text-sm font-medium ${
                  step >= s.n ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {s.label}
              </span>
              {i < steps.length - 1 && (
                <div className={`h-px w-8 ${step > s.n ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          {step === 1 && (
            <>
              <div className="mb-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xl font-bold text-white shadow-lg">
                  P
                </div>
                <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">Let's get started</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Step 1 of 3 — we'll send a 6-digit code to your email.
                </p>
              </div>
              <form onSubmit={handleSendCode} className="space-y-4">
                <Field label="Email">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </Field>
                {error && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
                    {error}
                  </p>
                )}
                <Button type="submit" className="w-full py-2.5" disabled={loading}>
                  {loading ? 'Sending...' : 'Send verification code'}
                </Button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Confirm your email</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Step 2 of 3 — enter the code sent to{' '}
                  <span className="font-medium text-gray-800 dark:text-gray-200">{email}</span>.
                </p>
              </div>
              <form onSubmit={handleVerify} className="space-y-4">
                <Field label="Verification code">
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="123456"
                    inputMode="numeric"
                    maxLength={6}
                    className="text-center text-lg tracking-[0.5em]"
                    required
                  />
                </Field>
                {message && <p className="text-sm text-green-600 dark:text-green-400">{message}</p>}
                {error && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
                    {error}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => { setStep(1); setCode(''); setError(null) }}
                  className="block w-full text-center text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  Resend or change email
                </button>
                <Button type="submit" className="w-full py-2.5" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify code'}
                </Button>
              </form>
            </>
          )}

          {step === 3 && (
            <>
              <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Set up your profile</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Step 3 of 3 — almost done!
                </p>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <Field label="Username">
                  <Input
                    value={form.username}
                    onChange={(e) => set('username', e.target.value)}
                    autoComplete="username"
                    placeholder="your-username"
                    required
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="First name">
                    <Input value={form.first_name} onChange={(e) => set('first_name', e.target.value)} required />
                  </Field>
                  <Field label="Last name">
                    <Input value={form.last_name} onChange={(e) => set('last_name', e.target.value)} required />
                  </Field>
                </div>
                <Field label="Password">
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => set('password', e.target.value)}
                    autoComplete="new-password"
                    placeholder="Uppercase, lowercase, number, symbol"
                    required
                  />
                </Field>
                <Field label="Confirm password">
                  <Input
                    type="password"
                    value={form.conf_password}
                    onChange={(e) => set('conf_password', e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </Field>
                {error && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
                    {error}
                  </p>
                )}
                <Button type="submit" className="w-full py-2.5" disabled={loading}>
                  {loading ? 'Creating account...' : 'Create account'}
                </Button>
              </form>
            </>
          )}
        </div>

        <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
            Sign in
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
  return e.response?.data?.message || e.message || 'Something went wrong'
}