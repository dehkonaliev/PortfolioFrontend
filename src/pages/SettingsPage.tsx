import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'
import { Field, Input, Textarea, Button } from '../components/ui'
import { getAssetUrl } from '../lib/constants'
import api from '../api/axios'

interface ProfileData {
  first_name: string
  last_name: string
  job_title: string
  summary: string
  address: string
  phone_number: string
  linkedin_url: string
  profile_photo?: string | null
  email?: string
  username?: string
}

const EMPTY: ProfileData = {
  first_name: '',
  last_name: '',
  job_title: '',
  summary: '',
  address: '',
  phone_number: '',
  linkedin_url: '',
}

export default function SettingsPage() {
  usePageTitle('Settings — YourResume')
  const { user, refreshUser, deleteAccount } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState<ProfileData>(EMPTY)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
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
          profile_photo: d.profile_photo ?? null,
          email: d.email,
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
      const payload: FormData | Record<string, unknown> = photoFile
        ? (() => {
            const fd = new FormData()
            fd.append('profile_photo', photoFile)
            return fd
          })()
        : {
            first_name: form.first_name,
            last_name: form.last_name,
            job_title: form.job_title,
            summary: form.summary,
            address: form.address,
            phone_number: form.phone_number,
            linkedin_url: form.linkedin_url,
          }
      await api.patch('/settings', payload)
      await refreshUser()
      setPhotoFile(null)
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {user ? `Signed in as @${String(user.username)}` : 'Manage your account'}
        </p>
      </div>

      {message && (
        <div className="mb-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-400">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Profile</h2>
          {loaded ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-500 text-2xl font-bold text-white">
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
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">A 300x300 thumbnail is auto-generated.</p>
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
                <Input value={form.job_title} onChange={(e) => set('job_title', e.target.value)} placeholder="e.g. Software Engineer" />
              </Field>
              <Field label="Summary">
                <Textarea rows={3} value={form.summary} onChange={(e) => set('summary', e.target.value)} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Phone">
                  <Input value={form.phone_number} onChange={(e) => set('phone_number', e.target.value)} />
                </Field>
                <Field label="LinkedIn URL">
                  <Input value={form.linkedin_url} onChange={(e) => set('linkedin_url', e.target.value)} />
                </Field>
              </div>
              <Field label="Address">
                <Input value={form.address} onChange={(e) => set('address', e.target.value)} />
              </Field>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
          )}
        </section>

        <div className="flex justify-end">
          <Button type="submit" className="px-6" disabled={saving || !loaded}>
            {saving ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </form>

      <section className="mt-8 rounded-2xl border border-red-200 bg-white p-6 shadow-sm dark:border-red-900 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">Delete account</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
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
          <Button variant="outline" className="mt-4 text-red-600 dark:text-red-400" onClick={() => setConfirmDelete(true)}>
            Delete account
          </Button>
        )}
      </section>
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