import { useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { usePublicProfile } from '../hooks/usePublicProfile'
import { usePageTitle } from '../hooks/usePageTitle'
import ProfileHeader from '../components/ProfileHeader'
import ManageSection from '../components/ManageSection'
import ContactsSection from '../components/ContactsSection'
import { LoadingScreen, NotFoundState } from '../components/States'
import { FolderIcon, IdIcon } from '../components/icons'
import { ChevronRightIcon } from '../components/icons-extras'

export default function ResumePage() {
  const { username } = useParams<{ username: string }>()
  const { data: profile, loading, error, refetch } = usePublicProfile(username)
  usePageTitle(username ? `${username}'s Resume` : 'Resume')

  const handleUpdated = useCallback(
    (options?: { silent?: boolean }) => {
      void refetch(options)
    },
    [refetch],
  )

  if (loading) {
    return <LoadingScreen label="Loading portfolio..." />
  }

  if (error || !profile) {
    return <NotFoundState message="User not found" />
  }

  const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.username

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8 max-sm:px-4">
      <ProfileHeader profile={profile} />

      {/* Contacts navigation */}
      {profile.email || profile.phone_number || profile.address || profile.linkedin_url || profile.telegram_url ? (
        <div className="mb-6 flex items-center gap-3">
          <a
            href="#contacts"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--accent)] bg-[var(--accent-soft)] px-3.5 py-1.5 text-[13px] font-medium text-[var(--accent)] shadow-[var(--shadow-card)] transition hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-white"
          >
            <IdIcon className="h-3.5 w-3.5" />
            Contacts
          </a>
        </div>
      ) : null}

      {/* Projects summary card */}
      <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-surface-raised)] text-[var(--text-tertiary)]">
            <FolderIcon className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Projects</h2>
            <p className="text-[13px] text-[var(--text-tertiary)]">
              {profile.projects.length} project{profile.projects.length !== 1 ? 's' : ''} by {name}
            </p>
          </div>
        </div>
        <Link
          to={`/${profile.username}/projects`}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] px-3.5 py-1.5 text-[13px] font-medium text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
        >
          View all
          <ChevronRightIcon className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="space-y-6">
        <ManageSection
          type="experiences"
          profile={profile}
          profileOwnerId={profile.id}
          onUpdated={() => handleUpdated({ silent: true })}
        />
        <ManageSection
          type="educations"
          profile={profile}
          profileOwnerId={profile.id}
          onUpdated={() => handleUpdated({ silent: true })}
        />
        <ManageSection
          type="skills"
          profile={profile}
          profileOwnerId={profile.id}
          onUpdated={() => handleUpdated({ silent: true })}
        />
        <ManageSection
          type="languages"
          profile={profile}
          profileOwnerId={profile.id}
          onUpdated={() => handleUpdated({ silent: true })}
        />
      </div>

      <ContactsSection profile={profile} />
    </div>
  )
}
