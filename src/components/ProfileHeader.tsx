import { useEffect, useState } from 'react'
import type { PublicProfile } from '../types'
import { getAssetUrl } from '../lib/constants'
import {
  MapPinIcon,
  PhoneIcon,
  LinkIcon,
  AwardIcon,
  BriefcaseIcon,
  GlobeIcon,
  GraduationIcon,
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
      <div className="mb-10 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-ink-900">
      {/* Flat neutral cover strip */}
      <div className="h-24 bg-paper-200/70 dark:bg-gradient-to-br dark:from-ink-950 dark:to-ink-900 sm:h-28" />

      <div className="px-6 pb-6 sm:px-8 sm:pb-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="-mt-16 flex flex-col items-center gap-4 sm:mt-0 sm:-mt-16 sm:flex-row sm:items-end">
            <Avatar
              photoUrl={photoUrl}
              name={fullName}
              onClick={() => setPreviewOpen(true)}
            />
            <div className="text-center sm:text-left">
              <h1 className="font-display text-2xl font-semibold leading-tight text-gray-900 dark:text-white sm:text-3xl">
                {fullName}
              </h1>
              <p className="mt-1 text-sm text-gray-400 dark:text-white/50">@{profile.username}</p>
              {profile.job_title && (
                <p className="mt-2 inline-flex items-center gap-1.5 text-base font-medium text-indigo-600 dark:text-indigo-400">
                  <BriefcaseIcon className="h-4 w-4" />
                  {profile.job_title}
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex w-full max-w-md flex-nowrap items-center justify-center gap-x-2 text-center sm:gap-5">
            <Stat value={profile.experiences.length} label="Roles" icon={<BriefcaseIcon className="h-4 w-4" />} />
            <Stat value={profile.skills.length} label="Skills" icon={<AwardIcon className="h-4 w-4" />} />
            <Stat value={profile.languages.length} label="Languages" icon={<GlobeIcon className="h-4 w-4" />} />
            <Stat value={profile.educations.length} label="Education" icon={<GraduationIcon className="h-4 w-4" />} />
          </div>
        </div>

        {profile.summary && (
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-300 sm:text-base">
            {profile.summary}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-white/50">
          {profile.address && (
            <span className="inline-flex items-center gap-1.5">
              <MapPinIcon className="h-4 w-4 text-gray-400 dark:text-white/40" />
              {profile.address}
            </span>
          )}
          {profile.phone_number && (
            <a
              href={`tel:${profile.phone_number}`}
              className="inline-flex items-center gap-1.5 transition hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              <PhoneIcon className="h-4 w-4 text-gray-400 dark:text-white/40" />
              {profile.phone_number}
            </a>
          )}
          {profile.linkedin_url && (
            <a
              href={profile.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 transition hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              <LinkIcon className="h-4 w-4 text-gray-400 dark:text-white/40" />
              LinkedIn
            </a>
          )}
        </div>
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
          className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
          aria-label="Close"
        >
          <CloseIcon />
        </button>
        <img
          src={photoUrl}
          alt={fullName}
          className="relative max-h-[85vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    )}
    </>
  )
}

function Avatar({ photoUrl, name, onClick }: { photoUrl: string | null; name: string; onClick: () => void }) {
  return (
    <div className="relative h-40 w-40 shrink-0 rounded-full p-[3px] shadow-lg sm:h-40 sm:w-40 sm:p-[4px]">
      <div className="avatar-ring absolute inset-0 rounded-full" />
      <div className="relative flex h-full w-full items-center justify-center rounded-full bg-white p-[4px] dark:bg-ink-900">
        {photoUrl ? (
          <button
            type="button"
            onClick={onClick}
            title="View full photo"
            aria-label="View full photo"
            className="flex h-full w-full cursor-pointer rounded-full"
          >
            <img src={photoUrl} alt={name} className="h-full w-full rounded-full object-cover" />
          </button>
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-3xl font-bold text-gray-600 dark:from-ink-800 dark:to-ink-800 dark:text-white">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  )
}

function Stat({ value, label, icon }: { value: number; label: string; icon: React.ReactNode }) {
  return (
    <div className="flex w-1/4 shrink-0 flex-col items-center sm:w-auto">
      <div className="flex items-baseline gap-1 text-2xl font-bold text-gray-900 dark:text-white">
        {value}
      </div>
      <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-white/50">
        {icon}
        {label}
      </div>
    </div>
  )
}
