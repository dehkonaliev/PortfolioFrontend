import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'
import { Field, Input, Textarea, Button } from '../components/ui'
import AutocompleteInput from '../components/AutocompleteInput'
import { getAssetUrl } from '../lib/constants'
import api from '../api/axios'
import { extractError } from '../lib/errors'

interface ProfileData {
  first_name: string
  last_name: string
  job_title: string
  summary: string
  email: string
  address: string
  phone_number: string
  linkedin_url: string
  telegram_url: string
  profile_photo?: string | null
  resume_file?: string | null
  username?: string
}

const EMPTY: ProfileData = {
  first_name: '',
  last_name: '',
  job_title: '',
  summary: '',
  email: '',
  address: '',
  phone_number: '',
  linkedin_url: '',
  telegram_url: '',
}

export default function SettingsPage() {
  usePageTitle('Settings — MyResume')
  const { user, refreshUser, deleteAccount } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState<ProfileData>(EMPTY)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [removeResume, setRemoveResume] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let active = true
    api
      .get('/me')
      .then((res) => {
        if (!active) return
        const d = res.data?.data ?? {}
        setForm({
          first_name: d.first_name ?? '',
          last_name: d.last_name ?? '',
          job_title: d.job_title ?? '',
          summary: d.summary ?? '',
          address: d.address ?? '',
          phone_number: d.phone_number ?? '',
          linkedin_url: d.linkedin_url ?? '',
          telegram_url: d.telegram_url ?? '',
          profile_photo: d.profile_photo ?? null,
          resume_file: d.resume_file ?? null,
          email: d.email ?? '',
          username: d.username,
        })
        setLoaded(true)
      })
      .catch(() => {
        if (active) setError('Failed to load profile')
      })
    return () => {
      active = false
    }
  }, [])

  const set = (key: keyof ProfileData, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setSaving(true)
    try {
      const textFields: Record<string, unknown> = {
        first_name: form.first_name,
        last_name: form.last_name,
        job_title: form.job_title,
        summary: form.summary,
        email: form.email,
        address: form.address,
        phone_number: form.phone_number,
        linkedin_url: form.linkedin_url,
        telegram_url: form.telegram_url,
      }

      let payload: FormData | Record<string, unknown>
      if (photoFile || resumeFile || removeResume) {
        const fd = new FormData()
        if (photoFile) fd.append('profile_photo', photoFile)
        if (resumeFile) {
          fd.append('resume_file', resumeFile)
        } else if (removeResume) {
          fd.append('resume_file', '')
        }
        for (const [key, value] of Object.entries(textFields)) {
          fd.append(key, String(value ?? ''))
        }
        payload = fd
      } else {
        payload = textFields
      }

      await api.patch('/settings', payload)
      await refreshUser()
      setPhotoFile(null)
      setResumeFile(null)
      setRemoveResume(false)
      setMessage('Profile saved')
    } catch (err) {
      setError(extractError(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setError(null)
    setDeleting(true)
    try {
      await deleteAccount()
      navigate('/')
    } catch (err) {
      setError(extractError(err))
      setDeleting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">Settings</h1>
        <p className="mt-1 text-sm text-[var(--text-tertiary)]">
          {user ? `Signed in as @${String(user.username)}` : 'Manage your account'}
        </p>
      </div>

      {message && (
        <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-card)]">
          <h2 className="mb-4 text-base font-semibold text-[var(--text-primary)]">Profile</h2>
          {loaded ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] text-2xl font-semibold text-[var(--text-tertiary)]">
                  {photoFile ? (
                    <img src={URL.createObjectURL(photoFile)} alt="Preview" className="h-full w-full object-cover" />
                  ) : form.profile_photo ? (
                    <img src={getAssetUrl(form.profile_photo) ?? ''} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    String(form.first_name || form.username || '?').charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1">
                  <Field label="Profile photo">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                    />
                  </Field>
                  <p className="mt-1 text-xs text-[var(--text-tertiary)]">A 300x300 thumbnail is auto-generated.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="First name">
                  <Input value={form.first_name} onChange={(e) => set('first_name', e.target.value)} />
                </Field>
                <Field label="Last name">
                  <Input value={form.last_name} onChange={(e) => set('last_name', e.target.value)} />
                </Field>
              </div>
              <Field label="Job title">
                <AutocompleteInput
                  type="job_title"
                  value={form.job_title}
                  onChange={(v) => set('job_title', v)}
                  placeholder="e.g. Software Engineer"
                />
              </Field>
              <Field label="Summary">
                <Textarea rows={3} value={form.summary} onChange={(e) => set('summary', e.target.value)} />
              </Field>
              <Field label="Resume file">
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => {
                    setResumeFile(e.target.files?.[0] ?? null)
                    if (e.target.files?.[0]) setRemoveResume(false)
                  }}
                />
                {resumeFile ? (
                  <p className="mt-1 text-xs text-[var(--text-tertiary)]">
                    Selected: {resumeFile.name}
                  </p>
                ) : form.resume_file ? (
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--text-tertiary)]">
                    <a
                      href={getAssetUrl(form.resume_file) ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--accent)] hover:underline"
                    >
                      {form.resume_file.split('/').pop()?.split('?')[0] ?? form.resume_file}
                    </a>
                    {removeResume ? (
                      <span className="font-medium text-red-500">will be removed</span>
                    ) : (
                      <button
                        type="button"
                        className="text-red-500 hover:underline"
                        onClick={() => {
                          setRemoveResume(true)
                          setResumeFile(null)
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ) : null}
                <p className="mt-1 text-xs text-[var(--text-tertiary)]">
                  Shown on your resume page via the download button. Max 10MB.
                </p>
              </Field>
            </div>
          ) : (
            <p className="text-sm text-[var(--text-tertiary)]">Loading...</p>
          )}
        </section>

        <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-card)]">
          <h2 className="mb-4 text-base font-semibold text-[var(--text-primary)]">Contacts</h2>
          {loaded ? (
            <div className="space-y-4">
              <Field label="Email">
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="you@example.com"
                />
              </Field>
              <Field label="Phone">
                <Input
                  type="tel"
                  value={form.phone_number}
                  onChange={(e) => set('phone_number', e.target.value)}
                  placeholder="+1 555 000 0000"
                />
              </Field>
              <Field label="Address">
                <Input value={form.address} onChange={(e) => set('address', e.target.value)} />
              </Field>
              <Field label="LinkedIn URL">
                <Input
                  value={form.linkedin_url}
                  onChange={(e) => set('linkedin_url', e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                />
              </Field>
              <Field label="Telegram URL">
                <Input
                  value={form.telegram_url}
                  onChange={(e) => set('telegram_url', e.target.value)}
                  placeholder="https://t.me/..."
                />
              </Field>
            </div>
          ) : (
            <p className="text-sm text-[var(--text-tertiary)]">Loading...</p>
          )}
        </section>

        <div className="flex justify-end">
          <Button type="submit" className="px-6" disabled={saving || !loaded}>
            {saving ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </form>

      <section className="mt-8 rounded-xl border border-red-200/50 bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-card)] dark:border-red-900/50">
        <h2 className="text-base font-semibold text-red-500">Delete account</h2>
        <p className="mt-1 text-sm text-[var(--text-tertiary)]">
          Permanently delete your account and all of your data. This cannot be undone.
        </p>
        {confirmDelete ? (
          <div className="mt-4 flex items-center gap-3">
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Yes, delete my account'}
            </Button>
            <Button variant="outline" onClick={() => setConfirmDelete(false)} disabled={deleting}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button variant="outline" className="mt-4 text-red-500" onClick={() => setConfirmDelete(true)}>
            Delete account
          </Button>
        )}
      </section>
    </div>
  )
}


