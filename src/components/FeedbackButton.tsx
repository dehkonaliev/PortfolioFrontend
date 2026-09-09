import { useEffect, useState } from 'react'
import Modal from './Modal'
import { Field, Textarea, Button } from './ui'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import { extractError } from '../lib/errors'
import { FeedbackIcon, CheckIcon } from './icons'

const MAX_LENGTH = 2000

export default function FeedbackButton() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (open) {
      setContent('')
      setError(null)
      setSent(false)
    }
  }, [open])

  if (!user) return null

  const close = () => {
    if (!submitting) setOpen(false)
  }

  const handleSubmit = async () => {
    if (submitting) return
    setError(null)
    const trimmed = content.trim()
    if (!trimmed) {
      setError('Please write a few words before sending.')
      return
    }
    setSubmitting(true)
    try {
      await api.post('/feedback', { content: trimmed })
      setSent(true)
    } catch (e) {
      setError(extractError(e, 'Could not send your feedback. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Send feedback"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[#0a0a0b] shadow-[var(--shadow-card)] transition hover:opacity-90"
      >
        <FeedbackIcon className="h-4 w-4" />
        Feedback
      </button>

      <Modal open={open} onClose={close} title={sent ? 'Thank you' : 'Send Feedback'}>
        {sent ? (
          <div className="flex flex-col items-center py-6 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
              <CheckIcon className="h-6 w-6" />
            </span>
            <h3 className="mt-4 text-base font-semibold text-[var(--text-primary)]">
              Thank you for your feedback!
            </h3>
            <p className="mt-1.5 max-w-sm text-sm text-[var(--text-secondary)]">
              Your thoughts mean a lot to us. We'll review your message and keep improving MyResume for you.
            </p>
            <Button variant="outline" className="mt-5" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Field label="Your feedback">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share a suggestion, a bug, or anything you'd like us to know..."
                rows={5}
                maxLength={MAX_LENGTH}
              />
              <div className="mt-1 flex justify-end text-xs text-[var(--text-tertiary)]">
                {content.length}/{MAX_LENGTH}
              </div>
            </Field>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-end gap-3 pt-1">
              <Button variant="outline" onClick={close} disabled={submitting}>
                Cancel
              </Button>
              <Button onClick={() => void handleSubmit()} disabled={submitting}>
                {submitting ? 'Sending...' : 'Send'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}