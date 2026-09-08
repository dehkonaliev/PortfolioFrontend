import { useCallback, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { usePublicProfile } from '../hooks/usePublicProfile'
import { usePageTitle } from '../hooks/usePageTitle'
import ProfileHeader from '../components/ProfileHeader'
import ManageSection from '../components/ManageSection'
import ContactsSection from '../components/ContactsSection'
import SectionNav from '../components/SectionNav'
import EndorsementsSection from '../components/EndorsementsSection'
import { LoadingScreen, NotFoundState } from '../components/States'
import { ChevronRightIcon } from '../components/icons-extras'
import { FolderIcon } from '../components/icons'
import { getAssetUrl, BASE_URL } from '../lib/constants'
import { useAuth } from '../context/AuthContext'
import type { PublicProfile } from '../types'

function getVisibleSections(profile: PublicProfile, isOwner: boolean): Set<string> {
  const sections = new Set<string>()
  if (isOwner || profile.experiences.length > 0) sections.add('experience')
  if (isOwner || profile.educations.length > 0) sections.add('education')
  if (isOwner || profile.skills.length > 0) sections.add('skills')
  if (isOwner || profile.languages.length > 0) sections.add('languages')
  sections.add('projects')
  if (profile.email || profile.phone_number || profile.address || profile.linkedin_url || profile.telegram_url) {
    sections.add('contacts')
  }
  return sections
}

export default function ResumePage() {
  const { username } = useParams<{ username: string }>()
  const { data: profile, loading, error, refetch } = usePublicProfile(username)
  const { user } = useAuth()
  usePageTitle(username ? `${username}'s Resume` : 'Resume')

  const handleUpdated = useCallback(
    (options?: { silent?: boolean }) => {
      void refetch(options)
    },
    [refetch],
  )

  const isOwner = !!user && user.id === profile?.id

  const visibleSections = useMemo(
    () => (profile ? getVisibleSections(profile, isOwner) : new Set<string>()),
    [profile, isOwner],
  )

  if (loading) {
    return <LoadingScreen label="Loading portfolio..." />
  }

  if (error || !profile) {
    return <NotFoundState message="User not found" />
  }

  const firstProjects = profile.projects.slice(0, 3)
  const hasMoreProjects = profile.projects.length > 3

  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.username
  const metaTitle = profile.job_title
    ? `${fullName} — ${profile.job_title}`
    : `${fullName}`
  const metaImage = getAssetUrl(profile.profile_photo || profile.profile_thumbnail)
  const metaUrl = `${BASE_URL}/${profile.username}`
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
        <meta property="og:type" content="profile" />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        {metaImage && <meta property="og:image" content={metaImage} />}
        <meta property="og:url" content={metaUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        {metaImage && <meta name="twitter:image" content={metaImage} />}
      </Helmet>
      <div className="lg:flex lg:items-start lg:gap-8">
        <SectionNav visibleSections={visibleSections} />

        <div className="min-w-0 flex-1">
          <ProfileHeader profile={profile} />

        <div className="space-y-6">
          {/* Experience */}
          {visibleSections.has('experience') && (
            <div id="experience">
              <ManageSection
                type="experiences"
                profile={profile}
                profileOwnerId={profile.id}
                onUpdated={() => handleUpdated({ silent: true })}
              />
            </div>
          )}

          {/* Education */}
          {visibleSections.has('education') && (
            <div id="education">
              <ManageSection
                type="educations"
                profile={profile}
                profileOwnerId={profile.id}
                onUpdated={() => handleUpdated({ silent: true })}
              />
            </div>
          )}

          {/* Skills */}
          {visibleSections.has('skills') && (
            <div id="skills">
              <ManageSection
                type="skills"
                profile={profile}
                profileOwnerId={profile.id}
                onUpdated={() => handleUpdated({ silent: true })}
              />
            </div>
          )}

          {/* Languages */}
          {visibleSections.has('languages') && (
            <div id="languages">
              <ManageSection
                type="languages"
                profile={profile}
                profileOwnerId={profile.id}
                onUpdated={() => handleUpdated({ silent: true })}
              />
            </div>
          )}

          {/* Projects — inline previews */}
          <div id="projects">
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-surface-raised)] text-[var(--text-tertiary)]">
                    <FolderIcon className="h-4 w-4" />
                  </span>
                  <h2 className="text-base font-semibold text-[var(--text-primary)]">Projects</h2>
                </div>
                {profile.projects.length > 0 && (
                  <Link
                    to={`/${profile.username}/projects`}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] px-3.5 py-1.5 text-[13px] font-medium text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] print:hidden"
                  >
                    View all
                    <ChevronRightIcon className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
              <div className="p-6">
                {profile.projects.length === 0 ? (
                  user && user.id === profile.id ? (
                    <Link
                      to={`/${profile.username}/projects`}
                      className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-[13px] font-semibold text-[#0a0a0b] transition hover:opacity-90 print:hidden"
                    >
                      Add your first project
                    </Link>
                  ) : (
                    <p className="text-sm text-[var(--text-tertiary)]">No projects yet.</p>
                  )
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {firstProjects.map((project) => (
                      <ProjectPreviewCard
                        key={project.id}
                        project={project}
                      />
                    ))}
                  </div>
                )}
                {hasMoreProjects && (
                  <div className="mt-4 text-center print:hidden">
                    <Link
                      to={`/${profile.username}/projects`}
                      className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--accent)] hover:underline"
                    >
                      View all {profile.projects.length} projects
                      <ChevronRightIcon className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Endorsements */}
          <div id="endorsements">
            <EndorsementsSection profile={profile} />
          </div>

          {/* Contacts */}
          <ContactsSection profile={profile} />
        </div>
        </div>
      </div>
    </div>
  )
}

function ProjectPreviewCard({ project }: { project: { id: string; name: string; description: string | null; technologies: string | null; cover_image: string | null; url: string | null } }) {
  const techList = project.technologies
    ? project.technologies.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 4)
    : []
  const coverImage = getAssetUrl(project.cover_image)

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] transition-colors hover:border-[var(--border-strong)]">
      <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-[var(--bg-surface)]">
        {coverImage ? (
          <img
            alt={project.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            src={coverImage}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-[var(--text-tertiary)]">
            {project.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 px-4 pt-3 pb-3">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          {project.url ? (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-[var(--accent)]"
            >
              {project.name}
            </a>
          ) : (
            project.name
          )}
        </h3>
        {project.description && (
          <p className="line-clamp-2 text-[13px] text-[var(--text-secondary)]">{project.description}</p>
        )}
        {techList.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {techList.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2 py-0.5 text-[11px] font-medium text-[var(--text-secondary)]"
              >
                {tech}
              </span>
            ))}
            {project.technologies && project.technologies.split(',').length > 4 && (
              <span className="rounded-full px-1 py-0.5 text-[11px] text-[var(--text-tertiary)]">
                +{project.technologies.split(',').length - 4} more
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
