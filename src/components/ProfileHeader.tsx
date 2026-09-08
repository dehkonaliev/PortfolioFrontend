import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import QRCode from 'qrcode'
import type { PublicProfile } from '../types'
import { getAssetUrl, BASE_URL } from '../lib/constants'
import { useAuth } from '../context/AuthContext'
import {
  BriefcaseIcon,
  CloseIcon,
  LinkIcon,
  CheckIcon,
  EditIcon,
  QrCodeIcon,
  DownloadIcon,
} from './icons'

function computeCompletion(profile: PublicProfile): number {
  let filled = 0
  let total = 8
  if (profile.profile_photo || profile.profile_thumbnail) filled++
  if (profile.job_title) filled++
  if (profile.summary) filled++
  if (profile.experiences.length > 0) filled++
  if (profile.skills.length > 0) filled++
  if (profile.educations.length > 0) filled++
  if (profile.languages.length > 0) filled++
  if (profile.email || profile.phone_number || profile.linkedin_url || profile.telegram_url) filled++
  return Math.round((filled / total) * 100)
}

export default function ProfileHeader({ profile }: { profile: PublicProfile }) {
  const { user } = useAuth()
  const isOwner = !!user && user.id === profile.id
  const photoUrl = getAssetUrl(profile.profile_photo || profile.profile_thumbnail)
  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.username
  const [previewOpen, setPreviewOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const resumeUrl = `${BASE_URL}/${profile.username}`
  const completion = isOwner ? computeCompletion(profile) : null

  const copyResumeLink = async () => {
    try {
      await navigator.clipboard.writeText(resumeUrl)
    } catch {
      const el = document.createElement('textarea')
      el.value = resumeUrl
      document.body.appendChild(el)
      el.select()
      try {
        document.execCommand('copy')
      } finally {
        document.body.removeChild(el)
      }
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  const generateQR = useCallback(async () => {
    if (qrDataUrl) return
    try {
      const url = await QRCode.toDataURL(resumeUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#111113',
          light: '#ffffff',
        },
      })
      setQrDataUrl(url)
    } catch {
      // QR generation failed silently
    }
  }, [resumeUrl, qrDataUrl])

  useEffect(() => {
    if (qrOpen) {
      void generateQR()
    }
  }, [qrOpen, generateQR])

  useEffect(() => {
    if (!previewOpen && !qrOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPreviewOpen(false)
        setQrOpen(false)
      }
    }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [previewOpen, qrOpen])

  const hasResume = !!profile.resume_file

  const handleDownloadResume = () => {
    const fileUrl = getAssetUrl(profile.resume_file)
    if (!fileUrl) return
    const a = document.createElement('a')
    a.href = fileUrl
    a.download = ''
    a.rel = 'noopener noreferrer'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <>
      <div className="mb-8 overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-[var(--shadow-card)]">
        {/* Cover strip */}
        <div className="h-20 bg-[var(--bg-surface-raised)] sm:h-24" />

        <div className="px-6 pb-6 sm:px-8 sm:pb-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
            <div className="-mt-14 flex flex-col items-center gap-3 sm:mt-0 sm:-mt-14 sm:flex-row sm:items-end">
              {/* Avatar */}
              <div className="relative h-28 w-28 shrink-0 sm:h-28 sm:w-28">
                {photoUrl ? (
                  <button
                    type="button"
                    onClick={() => setPreviewOpen(true)}
                    title="View full photo"
                    aria-label="View full photo"
                    className="flex h-full w-full cursor-pointer rounded-full border-2 border-[var(--border-subtle)]"
                  >
                    <img src={photoUrl} alt={fullName} className="h-full w-full rounded-full object-cover" />
                  </button>
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] text-2xl font-semibold text-[var(--text-tertiary)]">
                    {fullName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
                  {fullName}
                </h1>
                <p className="mt-0.5 text-sm text-[var(--text-tertiary)]">@{profile.username}</p>
                {profile.job_title && (
                  <span className="mt-2 inline-flex items-center rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 text-xs font-medium text-[var(--accent)]">
                    <BriefcaseIcon className="mr-1 h-3 w-3" />
                    {profile.job_title}
                  </span>
                )}
                <div className="mt-2 flex flex-col items-center justify-center gap-2 print:hidden sm:flex-row">
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={copyResumeLink}
                      title={`Copy ${resumeUrl}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--accent)] bg-[var(--accent-soft)] px-3.5 py-1.5 text-[13px] font-medium text-[var(--accent)] shadow-[var(--shadow-card)] transition hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-white"
                    >
                      {copied ? <CheckIcon className="h-3.5 w-3.5" /> : <LinkIcon className="h-3.5 w-3.5" />}
                      {copied ? 'Copied!' : 'Copy resume link'}
                    </button>
                    {isOwner && (
                      <Link
                        to="/settings"
                        title="Edit profile"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-1.5 text-[13px] font-medium text-[var(--text-secondary)] shadow-[var(--shadow-card)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
                      >
                        <EditIcon className="h-3.5 w-3.5" />
                        Edit profile
                      </Link>
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQrOpen(true)}
                      title="Show QR code"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-1.5 text-[13px] font-medium text-[var(--text-secondary)] shadow-[var(--shadow-card)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
                    >
                      <QrCodeIcon className="h-3.5 w-3.5" />
                      QR Code
                    </button>
                    {hasResume ? (
                      <button
                        type="button"
                        onClick={handleDownloadResume}
                        title="Download resume"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-1.5 text-[13px] font-medium text-[var(--text-secondary)] shadow-[var(--shadow-card)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
                      >
                        <DownloadIcon className="h-3.5 w-3.5" />
                        Download resume
                      </button>
                    ) : (
                      <span
                        title="No resume file uploaded"
                        className="inline-block cursor-not-allowed"
                        aria-disabled="true"
                      >
                        <button
                          type="button"
                          disabled
                          aria-disabled="true"
                          className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-1.5 text-[13px] font-medium text-[var(--text-tertiary)] opacity-60"
                        >
                          <DownloadIcon className="h-3.5 w-3.5" />
                          Download resume
                        </button>
                      </span>
                    )}
                  </div>
                </div>

                {/* Profile completion — owner only */}
                {completion !== null && (
                  <div className="mt-2 flex items-center gap-2 print:hidden">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[var(--bg-surface-raised)]">
                      <div
                        className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
                        style={{ width: `${completion}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-medium text-[var(--text-tertiary)]">
                      {completion}% complete
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {profile.summary && (
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)]">
              {profile.summary}
            </p>
          )}
        </div>
      </div>

      {/* Photo preview modal */}
      {previewOpen && photoUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${fullName} profile photo`}
          onClick={() => setPreviewOpen(false)}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <button
            onClick={() => setPreviewOpen(false)}
            className="absolute right-4 top-4 z-10 rounded-lg bg-white/10 p-2 text-white transition hover:bg-white/20"
            aria-label="Close"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
          <img
            src={photoUrl}
            alt={fullName}
            className="relative max-h-[85vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* QR Code modal */}
      {qrOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="QR Code"
          onClick={() => setQrOpen(false)}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <button
            onClick={() => setQrOpen(false)}
            className="absolute right-4 top-4 z-10 rounded-lg bg-white/10 p-2 text-white transition hover:bg-white/20"
            aria-label="Close"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
          <div
            className="relative rounded-2xl bg-[var(--bg-surface)] p-8 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Scan to view profile</h3>
            <p className="mt-1 text-sm text-[var(--text-tertiary)]">{resumeUrl}</p>
            <div className="mt-4 flex justify-center">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR Code" className="h-64 w-64 rounded-lg" />
              ) : (
                <div className="flex h-64 w-64 items-center justify-center rounded-lg bg-[var(--bg-surface-raised)]">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border-subtle)] border-t-[var(--accent)]" />
                </div>
              )}
            </div>
            {qrDataUrl && (
              <a
                href={qrDataUrl}
                download={`qr-${profile.username}.png`}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[#0a0a0b] transition hover:opacity-90"
              >
                <DownloadIcon className="h-4 w-4" />
                Download QR
              </a>
            )}
          </div>
        </div>
      )}
    </>
  )
}
