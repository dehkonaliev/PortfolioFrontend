import { useState } from 'react'
import api from '../api/axios'
import type {
  Experience,
  LanguageType,
  Skill,
  Education,
  Project,
  PublicProfile,
} from '../types'
import Section from './Section'
import ItemCard from './ItemCard'
import ProjectCard from './ProjectCard'
import SectionFormModal from './SectionFormModal'
import Modal from './Modal'
import { Button } from './ui'
import {
  BriefcaseIcon,
  GlobeIcon,
  AwardIcon,
  GraduationIcon,
  FolderIcon,
  CalendarIcon,
} from './icons'
import { EmptyState } from './States'
import { getAssetUrl } from '../lib/constants'
import { useAuth } from '../context/AuthContext'
import { extractError } from '../lib/errors'
import {
  TimelineList,
  TimelineItem,
  TimelineDescription,
} from './Timeline'
import { rangeText, durationLabel } from '../lib/timelineUtils'
import { ExternalLinkIcon } from './icons'

type ResourceType = 'experiences' | 'languages' | 'skills' | 'educations' | 'projects'

interface ManageSectionProps {
  type: ResourceType
  profile: PublicProfile | null
  profileOwnerId: string | null
  onUpdated: () => void
}

const METADATA: Record<
  ResourceType,
  { title: string; icon: React.ReactNode }
> = {
  experiences: { title: 'Experience', icon: <BriefcaseIcon className="h-4 w-4" /> },
  languages: { title: 'Languages', icon: <GlobeIcon className="h-4 w-4" /> },
  skills: { title: 'Skills', icon: <AwardIcon className="h-4 w-4" /> },
  educations: { title: 'Education', icon: <GraduationIcon className="h-4 w-4" /> },
  projects: { title: 'Projects', icon: <FolderIcon className="h-4 w-4" /> },
}

function endpointFromType(type: ResourceType): string {
  if (type === 'experiences') return '/experiences'
  if (type === 'languages') return '/languages'
  if (type === 'skills') return '/skills'
  if (type === 'educations') return '/educations'
  return '/projects'
}

function listFromType(profile: PublicProfile | null, type: ResourceType) {
  if (!profile) return []
  switch (type) {
    case 'experiences':
      return profile.experiences
    case 'languages':
      return profile.languages
    case 'skills':
      return profile.skills
    case 'educations':
      return profile.educations
    default:
      return profile.projects
  }
}

export default function ManageSection({ type, profile, profileOwnerId, onUpdated }: ManageSectionProps) {
  const { user } = useAuth()
  const isOwner = !!user && !!profileOwnerId && user.id === profileOwnerId

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const meta = METADATA[type]
  const items = listFromType(profile, type) as unknown[]
  const endpoint = endpointFromType(type)

  const openAdd = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (item: Record<string, unknown>) => {
    setEditing(item)
    setModalOpen(true)
  }

  const handleSubmit = async (data: Record<string, unknown>) => {
    setSubmitting(true)
    try {
      const payload: FormData | Record<string, unknown> = new FormData()
      const fileFields = ['cover_image', 'certification']
      for (const [key, value] of Object.entries(data)) {
        if (value instanceof File) {
          payload.append(key, value)
        } else if (fileFields.includes(key)) {
          continue
        } else if (value !== undefined && value !== null) {
          payload.append(key, String(value))
        }
      }

      if (editing?.id) {
        await api.patch(`${endpoint}/${editing.id}/`, payload)
      } else {
        await api.post(`${endpoint}/`, payload)
      }
      onUpdated()
      setModalOpen(false)
    } catch (e) {
      throw new Error(extractError(e))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeleteTarget(id)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    const id = deleteTarget
    setDeleteTarget(null)
    try {
      await api.delete(`${endpoint}/${id}/`)
      onUpdated()
    } catch (e) {
      setDeleteError(extractError(e))
    }
  }

  // Hide blank sections entirely from visitors (only the owner sees the empty "Add" state)
  if (items.length === 0 && !isOwner) {
    return null
  }

  return (
    <>
      <Section
        title={meta.title}
        icon={meta.icon}
        isOwner={isOwner}
        onAdd={openAdd}
      >
        {items.length === 0 ? (
          <EmptyState
            icon={meta.icon}
            title={`No ${meta.title.toLowerCase()} yet`}
            subtitle={isOwner ? `Add your first ${meta.title.toLowerCase()} to get started.` : 'This user hasn\'t added anything yet.'}
          />
        ) : type === 'projects' ? (
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {(items as Project[]).map((item) => (
              <ProjectCard
                key={item.id}
                name={item.name}
                description={item.description}
                technologies={item.technologies}
                coverImage={item.cover_image}
                url={item.url}
                ownerUsername={profile?.username}
                isOwner={isOwner}
                onEdit={() => openEdit(item as unknown as Record<string, unknown>)}
                onDelete={() => handleDelete(item.id)}
              />
            ))}
          </div>
        ) : type === 'experiences' || type === 'educations' ? (
          <TimelineList
            items={items as (Experience | Education)[]}
            emptyLabel={`No ${meta.title.toLowerCase()} added yet`}
          >
            {({ item }) => {
              const exp = item as Experience
              const edu = item as Education
              return (
                <TimelineItem
                  title={type === 'experiences' ? exp.job : edu.field}
                  subtitle={type === 'experiences' ? exp.company : edu.edu_place}
                  meta={
                    type === 'experiences' ? (
                      <ExperienceMeta item={exp} />
                    ) : (
                      <EducationMeta item={edu} />
                    )
                  }
                  description={
                    type === 'experiences'
                      ? exp.activity
                        ? <TimelineDescription text={exp.activity} />
                        : null
                      : edu.what_learnt
                        ? <TimelineDescription text={edu.what_learnt} />
                        : null
                  }
                  canEdit={isOwner}
                  onEdit={() => openEdit(item as unknown as Record<string, unknown>)}
                  onDelete={() => handleDelete((item as { id: string }).id)}
                >
                  {type === 'educations' && edu.certification && (
                    <a
                      href={getAssetUrl(edu.certification) ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[var(--accent)] hover:underline"
                    >
                      View certification
                      <ExternalLinkIcon className="h-3 w-3" />
                    </a>
                  )}
                </TimelineItem>
              )
            }}
          </TimelineList>
        ) : (
          <div className="flex flex-col gap-2">
            {(items as (LanguageType | Skill)[]).map((item) => (
              <ItemCard
                key={item.id}
                isOwner={isOwner}
                onEdit={() => openEdit(item as unknown as Record<string, unknown>)}
                onDelete={() => handleDelete(item.id)}
              >
                <RenderItem type={type} item={item} />
              </ItemCard>
            ))}
          </div>
        )}
      </Section>

      <SectionFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`${editing ? 'Edit' : 'Add'} ${meta.title}`}
        formType={type === 'projects' ? 'project' : type === 'educations' ? 'education' : type === 'languages' ? 'language' : type === 'skills' ? 'skill' : 'experience'}
        initial={editing as any}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Confirm delete">
        <p className="text-sm text-[var(--text-secondary)]">
          Are you sure you want to delete this? This action cannot be undone.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <Button variant="danger" onClick={confirmDelete}>
            Yes, delete
          </Button>
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
        </div>
      </Modal>

      <Modal open={!!deleteError} onClose={() => setDeleteError(null)} title="Delete failed">
        <p className="text-sm text-[var(--text-secondary)]">{deleteError}</p>
        <div className="mt-4">
          <Button variant="outline" onClick={() => setDeleteError(null)}>
            OK
          </Button>
        </div>
      </Modal>
    </>
  )
}

const SKILL_LEVEL_RANGES: { min: number; max: number; label: string }[] = [
  { min: 0, max: 20, label: 'Novice' },
  { min: 21, max: 40, label: 'Beginner' },
  { min: 41, max: 60, label: 'Intermediate' },
  { min: 61, max: 80, label: 'Advanced' },
  { min: 81, max: 100, label: 'Expert' },
]

function skillLevelLabel(pct: number): string {
  const v = Math.max(0, Math.min(100, pct))
  return (SKILL_LEVEL_RANGES.find((r) => v >= r.min && v <= r.max) ?? SKILL_LEVEL_RANGES[0]).label
}

function ExperienceMeta({ item }: { item: Experience }) {
  const { label, ongoing } = rangeText(item.from_date, item.to_date)
  const duration = durationLabel(item.from_date, item.to_date)
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[var(--text-tertiary)]">
      <span className="inline-flex items-center gap-1.5">
        <CalendarIcon className="h-3.5 w-3.5" />
        <span>{label}</span>
        {ongoing && <span className="font-medium text-[var(--accent)]">Present</span>}
      </span>
      {item.location ? (
        <>
          <span>·</span>
          <span>{item.location}</span>
        </>
      ) : null}
      {duration ? (
        <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--accent)]">
          {duration}
        </span>
      ) : null}
    </div>
  )
}

function EducationMeta({ item }: { item: Education }) {
  const { label, ongoing } = rangeText(item.from_date, item.to_date)
  const duration = durationLabel(item.from_date, item.to_date)
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[var(--text-tertiary)]">
      <span className="inline-flex items-center gap-1.5">
        <CalendarIcon className="h-3.5 w-3.5" />
        <span>{label}</span>
        {ongoing && <span className="font-medium text-[var(--accent)]">Present</span>}
      </span>
      {duration ? (
        <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--accent)]">
          {duration}
        </span>
      ) : null}
    </div>
  )
}

function RenderItem({ type, item }: { type: ResourceType; item: Experience | LanguageType | Skill | Education | Project }) {
  switch (type) {
    case 'languages': {
      const l = item as LanguageType
      return (
        <div>
          <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">{l.language}</h3>
          {l.level && (
            <span className="mt-1 inline-flex items-center rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-xs font-medium text-[var(--accent)]">
              {l.level}
            </span>
          )}
          {l.issued_by && <p className="mt-1 text-xs text-[var(--text-tertiary)]">{l.issued_by}</p>}
        </div>
      )
    }
    case 'skills': {
      const s = item as Skill
      const pct = Math.max(0, Math.min(100, s.level))
      return (
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">{s.name}</h3>
            <span className="flex items-baseline gap-2 text-xs">
              <span className="font-medium text-[var(--accent)]">{skillLevelLabel(pct)}</span>
              <span className="text-[var(--text-tertiary)]">{pct}%</span>
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-surface-raised)]">
            <div
              className="h-full rounded-full bg-[var(--accent)]"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )
    }
    case 'educations': {
      return null
    }
    case 'projects': {
      const p = item as Project
      return (
        <div className="flex gap-3">
          {p.cover_image && (
            <img
              src={getAssetUrl(p.cover_image) ?? ''}
              alt={p.name}
              className="h-16 w-24 shrink-0 rounded-lg object-cover"
            />
          )}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">{p.name}</h3>
            {p.description && <p className="mt-0.5 text-[13px] text-[var(--text-secondary)]">{p.description}</p>}
            {p.technologies && (
              <p className="mt-1 text-xs text-[var(--text-tertiary)]">{p.technologies}</p>
            )}
            {p.url && (
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[var(--accent)] hover:underline"
              >
                Visit project
              </a>
            )}
          </div>
        </div>
      )
    }
    default:
      return null
  }
}
