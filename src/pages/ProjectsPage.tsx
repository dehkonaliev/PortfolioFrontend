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
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <Link
          to={`/${profile.username}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          <ChevronRightIcon className="h-4 w-4 rotate-180" />
          Back to {name}'s resume
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Projects · {name}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
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