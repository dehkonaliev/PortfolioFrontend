import { useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { usePublicProfile } from '../hooks/usePublicProfile'
import { usePageTitle } from '../hooks/usePageTitle'
import ProfileHeader from '../components/ProfileHeader'
import ManageSection from '../components/ManageSection'
import { LoadingScreen, NotFoundState } from '../components/States'
import { FolderIcon } from '../components/icons'
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
    <div className="mx-auto max-w-6xl px-4 py-8">
      <ProfileHeader profile={profile} />

      {/* Projects summary card */}
      <div className="mb-10 flex items-center justify-between gap-4 rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition-colors duration-150 hover:border-black/10 dark:border-white/5 dark:bg-ink-900 dark:hover:border-white/10">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-md">
            <FolderIcon className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Projects</h2>
            <p className="text-sm text-gray-500 dark:text-white/50">
              {profile.projects.length} project{profile.projects.length !== 1 ? 's' : ''} by {name}
            </p>
          </div>
        </div>
        <Link
          to={`/${profile.username}/projects`}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-indigo-500 px-5 py-2.5 text-sm font-semibold text-indigo-600 transition-all duration-150 ease-out hover:bg-indigo-500 hover:text-white active:scale-[0.98] dark:border-indigo-400 dark:text-indigo-300 dark:hover:bg-indigo-400 dark:hover:text-white"
        >
          View all
          <ChevronRightIcon className="h-4 w-4" />
        </Link>
      </div>

      <div className="space-y-10">
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
    </div>
  )
}