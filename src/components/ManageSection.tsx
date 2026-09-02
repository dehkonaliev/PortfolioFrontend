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
  experiences: { title: 'Experience', icon: <BriefcaseIcon /> },
  languages: { title: 'Languages', icon: <GlobeIcon /> },
  skills: { title: 'Skills', icon: <AwardIcon /> },
  educations: { title: 'Education', icon: <GraduationIcon /> },
  projects: { title: 'Projects', icon: <FolderIcon /> },
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
      throw new Error(getErrorMessage(e))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this?')) return
    try {
      await api.delete(`${endpoint}/${id}/`)
      onUpdated()
    } catch (e) {
      alert(getErrorMessage(e))
    }
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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
        ) : (
          (items as (Experience | LanguageType | Skill | Education)[]).map((item) => (
            <ItemCard
              key={item.id}
              isOwner={isOwner}
              onEdit={() => openEdit(item as unknown as Record<string, unknown>)}
              onDelete={() => handleDelete(item.id)}
            >
              <RenderItem type={type} item={item} />
            </ItemCard>
          ))
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
    </>
  )
}

function getErrorMessage(e: unknown): string {
  const err = e as { response?: { data?: { data?: Record<string, unknown>, message?: string } }, message?: string }
  if (err.response?.data) {
    const d = err.response.data as { message?: string; data?: Record<string, unknown> }
    if (d.message) return d.message
    if (d.data) {
      for (const val of Object.values(d.data)) {
        if (Array.isArray(val)) return String(val[0])
        return String(val)
      }
    }
  }
  return err.message || 'Something went wrong'
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

function RenderItem({ type, item }: { type: ResourceType; item: Experience | LanguageType | Skill | Education | Project }) {
  switch (type) {
    case 'experiences': {
      const e = item as Experience
      return (
        <div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <h3 className="font-semibold text-gray-900 dark:text-white">{e.job}</h3>
            <span className="text-sm text-gray-500 dark:text-white/50">
              <span className="mr-1 text-gray-400 dark:text-white/40">·</span>
              {e.company}
            </span>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-400 dark:text-white/40">
            <CalendarIcon className="h-3.5 w-3.5" />
            {e.from_date} — {e.to_date}
            {e.location ? ` · ${e.location}` : ''}
          </p>
          {e.activity && <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{e.activity}</p>}
        </div>
      )
    }
    case 'languages': {
      const l = item as LanguageType
      return (
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{l.language}</h3>
          <p className="text-sm text-gray-500 dark:text-white/50">{l.level}</p>
          {l.issued_by && <p className="text-xs text-gray-400 dark:text-white/40">{l.issued_by}</p>}
        </div>
      )
    }
    case 'skills': {
      const s = item as Skill
      const pct = Math.max(0, Math.min(100, s.level))
      return (
        <div>
          <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">{s.name}</h3>
            <span className="flex items-baseline gap-2 text-xs">
              <span className="font-medium text-indigo-600 dark:text-indigo-400">{skillLevelLabel(pct)}</span>
              <span className="text-gray-400 dark:text-white/50">{pct}%</span>
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full border border-black/10 bg-gray-100 dark:border-white/10 dark:bg-ink-800">
            <div
              className="h-full rounded-full bg-indigo-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )
    }
    case 'educations': {
      const edu = item as Education
      return (
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{edu.field}</h3>
          <p className="text-sm text-gray-500 dark:text-white/50">{edu.edu_place}</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-400 dark:text-white/40">
            <CalendarIcon className="h-3.5 w-3.5" />
            {edu.from_date} — {edu.to_date}
          </p>
          {edu.what_learnt && <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{edu.what_learnt}</p>}
          {edu.certification && (
            <a
              href={getAssetUrl(edu.certification) ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            >
              View certification
            </a>
          )}
        </div>
      )
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
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{p.name}</h3>
            {p.description && <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-300">{p.description}</p>}
            {p.technologies && (
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{p.technologies}</p>
            )}
            {p.url && (
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
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