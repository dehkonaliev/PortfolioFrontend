import { useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { usePublicProfile } from '../hooks/usePublicProfile'
import { usePageTitle } from '../hooks/usePageTitle'
import ManageSection from '../components/ManageSection'
import { LoadingScreen, NotFoundState } from '../components/States'
import { ChevronRightIcon } from '../components/icons-extras'
import { getAssetUrl, BASE_URL } from '../lib/constants'

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
  const metaTitle = profile.job_title
    ? `${name} — ${profile.job_title}`
    : name
  const metaImage = getAssetUrl(profile.profile_photo || profile.profile_thumbnail)
  const metaUrl = `${BASE_URL}/${profile.username}/projects`
  const metaDescription =
    profile.summary ||
    [profile.job_title, `@${profile.username}`].filter(Boolean).join(' · ')

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8 max-sm:px-4">
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={metaUrl} />
        <meta property="og:site_name" content="MyResume" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        {metaImage && <meta property="og:image" content={metaImage} />}
        <meta property="og:url" content={metaUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        {metaImage && <meta name="twitter:image" content={metaImage} />}
      </Helmet>
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
