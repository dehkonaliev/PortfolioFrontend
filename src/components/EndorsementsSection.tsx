import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Modal from './Modal'
import EndorsementCard from './EndorsementCard'
import { Button, Input, Textarea, Field } from './ui'
import { QuoteIcon, PlusIcon } from './icons'
import api from '../api/axios'
import { extractError } from '../lib/errors'
import type { PublicProfile, Endorsement } from '../types'

export default function EndorsementsSection({ profile }: { profile: PublicProfile }) {
  const { user } = useAuth()
  const [list, setList] = useState<Endorsement[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [authorName, setAuthorName] = useState('')
  const [authorTitle, setAuthorTitle] = useState('')
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await api.get('/endorsements', { params: { user: profile.id } })
      setList((res.data?.data as Endorsement[]) ?? [])
    } catch {
      setList([])
    } finally {
      setLoading(false)
    }
  }, [profile.id])

  useEffect(() => {
    setLoading(true)
    void load()
  }, [load])

  const submit = async () => {
    const trimmedName = authorName.trim()
    const trimmedText = text.trim()
    if (!trimmedName || !trimmedText) return
    setSaving(true)
    setError(null)
    try {
      const res = await api.post('/endorsements', {
        author_name: trimmedName,
        author_title: authorTitle.trim() || null,
        text: trimmedText,
      })
      const created = res.data?.data as Endorsement
      setList((prev) => [created, ...prev])
      setModalOpen(false)
      setAuthorName('')
      setAuthorTitle('')
      setText('')
    } catch (err) {
      setError(extractError(err))
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: string) => {
    try {
      await api.delete(`/endorsements/${id}`)
      setList((prev) => prev.filter((e) => e.id !== id))
    } catch {
      // ignore removal errors
    }
  }

  const isOwner = !!user && user.id === profile.id

  if (loading) return null
  if (list.length === 0 && !isOwner) return null

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-surface-raised)] text-[var(--text-tertiary)]">
            <QuoteIcon className="h-4 w-4" />
          </span>
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Recommendations</h2>
          {list.length > 0 && (
            <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-xs font-medium text-[var(--accent)]">
              {list.length}
            </span>
          )}
        </div>
        {isOwner && (
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-[13px] font-semibold text-[#0a0a0b] transition hover:opacity-90 active:scale-[0.98]"
          >
            <PlusIcon className="h-3.5 w-3.5" />
            Add
          </button>
        )}
      </div>
      <div className="p-6">
        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-surface-raised)]/50 px-6 py-12 text-center">
            <QuoteIcon className="h-8 w-8 text-[var(--border-strong)]" />
            <h3 className="mt-3 text-sm font-semibold text-[var(--text-primary)]">No recommendations yet</h3>
            <p className="mt-1 text-sm text-[var(--text-tertiary)]">
              {isOwner
                ? 'Add endorsements from colleagues and clients to build trust.'
                : 'Ask colleagues or clients to recommend them.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {list.map((e) => (
              <EndorsementCard key={e.id} endorsement={e} canDelete={isOwner} onDelete={() => remove(e.id)} />
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add recommendation">
        <div className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}
          <Field label="Author name">
            <Input value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="e.g. John Doe" />
          </Field>
          <Field label="Author title">
            <Input value={authorTitle} onChange={(e) => setAuthorTitle(e.target.value)} placeholder="e.g. Engineering Manager at Acme" />
          </Field>
          <Field label="Recommendation">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              placeholder="What would they say about working with you?"
            />
          </Field>
          <div className="flex items-center gap-3">
            <Button onClick={submit} disabled={!authorName.trim() || !text.trim() || saving}>
              {saving ? 'Saving...' : 'Save recommendation'}
            </Button>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}