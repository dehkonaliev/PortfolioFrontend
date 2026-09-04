import { useEffect, useState } from 'react'
import type { PublicProfile } from '../types'
import { getAssetUrl } from '../lib/constants'
import {
  BriefcaseIcon,
  CloseIcon,
} from './icons'

export default function ProfileHeader({ profile }: { profile: PublicProfile }) {
  const photoUrl = getAssetUrl(profile.profile_photo || profile.profile_thumbnail)
  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.username
  const [previewOpen, setPreviewOpen] = useState(false)

  useEffect(() => {
    if (!previewOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewOpen(false)
    }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [previewOpen])

  return (
    <>
      <div className="mb-8 overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-[var(--shadow-card)]">
        {/* Cover strip */}
        <div className="h-20 bg-[var(--bg-surface-raised)] sm:h-24" />

        <div className="px-6 pb-6 sm:px-8 sm:pb-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="-mt-14 flex flex-col items-center gap-3 sm:mt-0 sm:-mt-14 sm:flex-row sm:items-end">
              {/* Avatar — plain ring, no rainbow */}
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
              </div>
            </div>

            {/* Stats — equal columns with vertical dividers */}
            <div className="flex w-full max-w-sm flex-nowrap items-stretch divide-x divide-[var(--border-subtle)] rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-center">
              <Stat value={profile.experiences.length} label="Roles" />
              <Stat value={profile.skills.length} label="Skills" />
              <Stat value={profile.languages.length} label="Languages" />
              <Stat value={profile.educations.length} label="Education" />
            </div>
          </div>

          {profile.summary && (
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)]">
              {profile.summary}
            </p>
          )}
        </div>
      </div>

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
    </>
  )
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-1 flex-col items-center py-3">
      <span className="text-xl font-semibold text-[var(--text-primary)]">{value}</span>
      <span className="mt-0.5 text-xs font-medium uppercase tracking-wide text-[var(--text-tertiary)]">{label}</span>
    </div>
  )
}
