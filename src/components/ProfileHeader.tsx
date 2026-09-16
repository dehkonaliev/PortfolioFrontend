import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import QRCode from 'qrcode'
import type { PublicProfile } from '../types'
import { getAssetUrl, BASE_URL } from '../lib/constants'
import { useAuth } from '../context/AuthContext'
import { useTypewriter } from '../hooks/useTypewriter'
import Modal from './Modal'
import {
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
  const socials = profile.social_links
  if (
    profile.email ||
    profile.phone_number ||
    (socials &&
      (socials.website_url ||
        socials.github_url ||
        socials.linkedin_url ||
        socials.telegram_url ||
        socials.behance_url ||
        socials.figma_url))
  )
    filled++
  return Math.round((filled / total) * 100)
}

export default function ProfileHeader({ profile }: { profile: PublicProfile }) {
  const { user } = useAuth()
  const isOwner = !!user && user.id === profile.id
  const photoUrl = getAssetUrl(profile.profile_photo || profile.profile_thumbnail)
  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.username
  const { text: typedTitle, phase: typePhase } = useTypewriter(profile.job_title ?? '')
  const typeCursor = typePhase === 'typing' || typePhase === 'hold'
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
          dark: '#050505',
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
      <div className="panel-card reveal mb-8">
        <div className="px-6 pb-8 pt-8 sm:px-10 sm:pb-10 sm:pt-12">
          <div className="flex flex-col-reverse items-center gap-8 lg:flex-row lg:items-center lg:justify-between">
            {/* Content — left side */}
            <div className="flex max-w-xl flex-col items-center text-center lg:items-start lg:text-left">
              <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl">
                {fullName}
              </h1>
              <p className="mt-0.5 text-sm text-[var(--text-tertiary)]">@{profile.username}</p>
              {profile.job_title && (
                <span className="mt-1.5 text-sm">
                  <span className="relative inline-block whitespace-nowrap">
                    <span className="invisible fire-text" aria-hidden="true">{profile.job_title}</span>
                    <span className="absolute inset-0 fire-text" aria-label={profile.job_title}>
                      {typedTitle}
                      <img
                        src="/loaders/fire.svg"
                        alt=""
                        className={`ml-1 inline-block h-[1.56em] w-[0.9em] align-baseline motion-reduce:hidden ${typeCursor ? '' : 'invisible'}`}
                      />
                    </span>
                  </span>
                </span>
              )}
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 print:hidden lg:justify-start">
                  <button
                    type="button"
                    onClick={copyResumeLink}
                    title={`Copy ${resumeUrl}`}
                    className="btn-tactile inline-flex whitespace-nowrap items-center gap-1.5 rounded-lg border border-[var(--accent)] bg-[var(--accent-soft)] px-3.5 py-1.5 text-[13px] font-medium text-[var(--accent)] shadow-[var(--shadow-card)] transition hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-white"
                  >
                    {copied ? <CheckIcon className="h-3.5 w-3.5" /> : <LinkIcon className="h-3.5 w-3.5" />}
                    {copied ? 'Copied!' : 'Copy resume link'}
                  </button>
                  {isOwner && (
                    <Link
                      to="/settings"
                      title="Edit profile"
                      className="btn-tactile inline-flex whitespace-nowrap items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-1.5 text-[13px] font-medium text-[var(--text-secondary)] shadow-[var(--shadow-card)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
                    >
                      <EditIcon className="h-3.5 w-3.5" />
                      Edit profile
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => setQrOpen(true)}
                    title="Show QR code"
                    className="btn-tactile inline-flex whitespace-nowrap items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-1.5 text-[13px] font-medium text-[var(--text-secondary)] shadow-[var(--shadow-card)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
                  >
                    <QrCodeIcon className="h-3.5 w-3.5" />
                    QR Code
                  </button>
                  {hasResume ? (
                    <button
                      type="button"
                      onClick={handleDownloadResume}
                      title="Download resume"
                      className="btn-tactile inline-flex whitespace-nowrap items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-1.5 text-[13px] font-medium text-[var(--text-secondary)] shadow-[var(--shadow-card)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
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
                        className="inline-flex cursor-not-allowed whitespace-nowrap items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-1.5 text-[13px] font-medium text-[var(--text-tertiary)] opacity-60"
                      >
                        <DownloadIcon className="h-3.5 w-3.5" />
                        Download resume
                      </button>
                    </span>
                  )}
                </div>

              {profile.summary && (
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)]">
                  {profile.summary}
                </p>
              )}

              {/* Profile completion — owner only */}
              {completion !== null && (
                <div className="mt-3 flex items-center gap-2 print:hidden">
                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[var(--bg-surface-raised)]">
                    <div
                      className="progress-fill-animate h-full rounded-full bg-[var(--accent)]"
                      style={{ width: `${completion}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-[var(--text-tertiary)]">
                    {completion}% complete
                  </span>
                </div>
              )}
            </div>

            {/* Avatar — large square, subtle 3D tilt on hover */}
            <div className="relative w-full max-w-[21rem] shrink-0 [perspective:1400px] lg:max-w-[20rem]">
              {photoUrl ? (
                <button
                  type="button"
                  onClick={() => setPreviewOpen(true)}
                  title="View full photo"
                  aria-label="View full photo"
                  className="avatar-tilt block w-full cursor-pointer [transform-style:preserve-3d]"
                >
                  <span className="avatar-tilt-face block aspect-square w-full overflow-hidden rounded-[20px] [transform-style:preserve-3d]">
                    <img src={photoUrl} alt={fullName} className="h-full w-full object-cover" />
                  </span>
                </button>
              ) : (
                <div className="flex aspect-square w-full items-center justify-center rounded-[20px] text-6xl font-semibold text-white/80">
                  {fullName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Photo preview modal */}
      <Modal open={previewOpen && !!photoUrl} onClose={() => setPreviewOpen(false)} variant="bare">
        {photoUrl && (
          <div className="relative">
            <button
              onClick={() => setPreviewOpen(false)}
              className="btn-tactile absolute right-4 top-4 z-10 rounded-lg bg-white/10 p-2 text-white transition hover:bg-white/20"
              aria-label="Close"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
            <img
              src={photoUrl}
              alt={fullName}
              className="relative max-h-[85vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
            />
          </div>
        )}
      </Modal>

      {/* QR Code modal */}
      <Modal open={qrOpen} onClose={() => setQrOpen(false)} variant="bare">
        <div className="relative rounded-2xl bg-[var(--bg-surface)] p-8 text-center shadow-2xl">
          <button
            onClick={() => setQrOpen(false)}
            className="btn-tactile absolute right-3 top-3 z-10 rounded-lg bg-white/10 p-2 text-white transition hover:bg-white/20"
            aria-label="Close"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
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
              className="btn-tactile btn-primary mt-4 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white transition"
            >
              <DownloadIcon className="h-4 w-4" />
              Download QR
            </a>
          )}
        </div>
      </Modal>
    </>
  )
}
