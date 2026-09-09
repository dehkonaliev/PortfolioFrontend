import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth, type SignupData } from '../context/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'
import { Field, Input, Button } from '../components/ui'
import { extractError } from '../lib/errors'

type Step = 1 | 2 | 3

export default function SignupPage() {
  usePageTitle('Sign up — MyResume')
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
    <div className="mx-auto flex min-h-[75vh] max-w-sm items-center px-4 py-16">
      <div className="w-full">
        {/* Stepper */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {steps.map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition ${
                  step >= s.n
                    ? 'bg-[var(--accent)] text-[#0a0a0b]'
                    : 'border border-[var(--border-subtle)] text-[var(--text-tertiary)]'
                }`}
              >
                {s.n}
              </div>
              <span
                className={`text-sm font-medium ${
                  step >= s.n ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'
                }`}
              >
                {s.label}
              </span>
              {i < steps.length - 1 && (
                <div className={`h-px w-8 ${step > s.n ? 'bg-[var(--accent)]' : 'bg-[var(--border-subtle)]'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 shadow-[var(--shadow-card)]">
          {step === 1 && (
            <>
              <div className="mb-6 text-center">
                <h1 className="text-xl font-semibold text-[var(--text-primary)]">Let's get started</h1>
                <p className="mt-1 text-sm text-[var(--text-tertiary)]">
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
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
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
                <h1 className="text-xl font-semibold text-[var(--text-primary)]">Confirm your email</h1>
                <p className="mt-1 text-sm text-[var(--text-tertiary)]">
                  Step 2 of 3 — enter the code sent to{' '}
                  <span className="font-medium text-[var(--text-secondary)]">{email}</span>.
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
                {message && <p className="text-sm text-emerald-500">{message}</p>}
                {error && (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                    {error}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => { setStep(1); setCode(''); setError(null) }}
                  className="block w-full text-center text-sm font-medium text-[var(--accent)] hover:underline"
                >
                  Resend or change email
                </button>
                <p className="text-center text-xs text-[var(--text-tertiary)]">
                  Didn't get the code? Check your spam or junk folder — it sometimes lands there.
                </p>
                <Button type="submit" className="w-full py-2.5" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify code'}
                </Button>
              </form>
            </>
          )}

          {step === 3 && (
            <>
              <div className="mb-6 text-center">
                <h1 className="text-xl font-semibold text-[var(--text-primary)]">Set up your profile</h1>
                <p className="mt-1 text-sm text-[var(--text-tertiary)]">
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
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
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

        <p className="mt-4 text-center text-sm text-[var(--text-tertiary)]">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-[var(--accent)] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}


