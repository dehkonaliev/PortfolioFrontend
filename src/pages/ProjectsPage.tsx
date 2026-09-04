import { useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { usePublicProfile } from '../hooks/usePublicProfile'
import { usePageTitle } from '../hooks/usePageTitle'
import ManageSection from '../components/ManageSection'
import { LoadingScreen, NotFoundState } from '../components/States'
import { ChevronRightIcon } from '../components/icons-extras'

export default function ProjectsPage() {
  const { username } = useParams<{ username: string }>()
  const { data: profile, loading, error, refetch } = usePublicProfile(username)
  usePageTitle(username ? `${username}'s Projects` : 'Projects')

  const handleUpdated = useCallback(() => {
    void refetch({ silent: true })
  }, [refetch])

  if (loading) {
    return <LoadingScreen label="Loading projects..." />
  }

  if (error || !profile) {
    return <NotFoundState message="User not found" />
  }

  const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.username

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8 max-sm:px-4">
      <div className="mb-8">
        <Link
          to={`/${profile.username}`}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--accent)] hover:underline"
        >
          <ChevronRightIcon className="h-3.5 w-3.5 rotate-180" />
          Back to {name}'s resume
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
          Projects · {name}
        </h1>
        <p className="mt-1 text-sm text-[var(--text-tertiary)]">
          {profile.projects.length} project{profile.projects.length !== 1 ? 's' : ''} showcased by {name}
        </p>
      </div>

      <ManageSection
        type="projects"
        profile={profile}
        profileOwnerId={profile.id}
        onUpdated={handleUpdated}
      />
    </div>
  )
}
