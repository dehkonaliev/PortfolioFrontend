import { useMemo, useRef, useState } from 'react'
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
import { ChevronDownIcon, ChevronLeftIcon, ListOrderedIcon } from './icons'
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

const SKILLS_PER_PAGE = 7

interface DragSession {
  pointerId: number
  fromId: string
  startIndex: number
  hoveredId: string | null
  ghost: HTMLDivElement | null
  offsetX: number
  offsetY: number
  onMove: (e: PointerEvent) => void
  onUp: () => void
}

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

  const [skillsExpanded, setSkillsExpanded] = useState(false)
  const [reordering, setReordering] = useState(false)
  const dragStateRef = useRef<DragSession | null>(null)
  const reorderOrderRef = useRef<string[] | null>(null)
  const [reorderOrder, setReorderOrder] = useState<string[] | null>(null)
  const [reorderError, setReorderError] = useState<string | null>(null)
  const [reorderSaving, setReorderSaving] = useState(false)

  const meta = METADATA[type]
  const items = listFromType(profile, type) as unknown[]
  const endpoint = endpointFromType(type)

  const displayedSkills = useMemo(() => {
    if (type !== 'skills') return []
    const sorted = [...(items as Skill[])]
    if (reorderOrder) {
      const byId = new Map(sorted.map((s) => [s.id, s]))
      sorted.sort((a, b) => {
        const ia = reorderOrder.indexOf(a.id)
        const ib = reorderOrder.indexOf(b.id)
        return (ia === -1 ? Number.MAX_SAFE_INTEGER : ia) - (ib === -1 ? Number.MAX_SAFE_INTEGER : ib)
      })
      return sorted.filter((s) => byId.has(s.id))
    }
    return sorted
  }, [type, items, reorderOrder])

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

  const startReorder = () => {
    const ids = (items as Skill[]).map((s) => s.id)
    reorderOrderRef.current = ids
    setReorderOrder(ids)
    setReorderError(null)
    setReordering(true)
    setSkillsExpanded(true)
  }

  const endDrag = () => {
    const drag = dragStateRef.current
    if (drag) {
      if (drag.ghost) drag.ghost.remove()
      window.removeEventListener('pointermove', drag.onMove)
      window.removeEventListener('pointerup', drag.onUp)
      dragStateRef.current = null
    }
    document.body.style.userSelect = ''
    document.body.style.cursor = ''
  }

  const persistDrag = () => {
    const drag = dragStateRef.current
    if (!drag) return
    const newIndex = reorderOrderRef.current?.indexOf(drag.fromId) ?? -1
    if (newIndex === -1 || newIndex === drag.startIndex) return
    setReorderSaving(true)
    setReorderError(null)
    api
      .patch(`/reorder-skill/${drag.fromId}`, { order: newIndex })
      .then(() => onUpdated())
      .catch((e: unknown) => setReorderError(extractError(e)))
      .finally(() => setReorderSaving(false))
  }

  const cancelReorder = () => {
    endDrag()
    reorderOrderRef.current = null
    setReorderOrder(null)
    setReordering(false)
    setSkillsExpanded(false)
  }

  const finishReorder = () => {
    endDrag()
    reorderOrderRef.current = null
    setReorderOrder(null)
    setReordering(false)
    setSkillsExpanded(false)
    onUpdated()
  }

  const reorderAround = (fromId: string, toId: string) => {
    setReorderOrder((prev) => {
      if (!prev) return prev
      const next = [...prev]
      const fromIndex = next.indexOf(fromId)
      const toIndex = next.indexOf(toId)
      if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return prev
      next.splice(fromIndex, 1)
      next.splice(toIndex, 0, fromId)
      reorderOrderRef.current = next
      return next
    })
  }

  const startDrag = (e: React.PointerEvent<HTMLSpanElement>, skillId: string) => {
    if (!reordering) return
    e.preventDefault()
    if (dragStateRef.current) return

    const sourceEl = (e.currentTarget.closest('[data-skill-id]') ?? e.currentTarget) as HTMLElement
    const rect = sourceEl.getBoundingClientRect()
    const ghost = sourceEl.cloneNode(true) as HTMLDivElement
    ghost.style.position = 'fixed'
    ghost.style.left = `${rect.left}px`
    ghost.style.top = `${rect.top}px`
    ghost.style.width = `${rect.width}px`
    ghost.style.margin = '0'
    ghost.style.pointerEvents = 'none'
    ghost.style.zIndex = '1000'
    ghost.style.opacity = '0.9'
    ghost.style.boxShadow = '0 10px 30px rgba(0,0,0,0.25)'
    document.body.appendChild(ghost)

    const offsetX = e.clientX - rect.left
    const offsetY = e.clientY - rect.top
    const pointerId = e.pointerId

    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'grabbing'

    const drag: DragSession = {
      pointerId,
      fromId: skillId,
      startIndex: reorderOrderRef.current?.indexOf(skillId) ?? -1,
      hoveredId: null,
      ghost,
      offsetX,
      offsetY,
      onMove: () => {},
      onUp: () => {},
    }

    drag.onMove = (ev: PointerEvent) => {
      if (ev.pointerId !== drag.pointerId) return
      if (ev.buttons === 0) {
        persistDrag()
        endDrag()
        return
      }
      drag.ghost!.style.left = `${ev.clientX - drag.offsetX}px`
      drag.ghost!.style.top = `${ev.clientY - drag.offsetY}px`

      const under = document.elementsFromPoint(ev.clientX, ev.clientY)
      let targetId: string | null = null
      for (const el of under) {
        if (!(el instanceof HTMLElement)) continue
        const id = el.getAttribute('data-skill-id')
        if (id) {
          targetId = id
          break
        }
      }
      if (targetId && targetId !== drag.fromId && drag.hoveredId !== targetId) {
        drag.hoveredId = targetId
        reorderAround(drag.fromId, targetId)
      } else if (!targetId) {
        drag.hoveredId = null
      }
    }

    drag.onUp = () => {
      persistDrag()
      endDrag()
    }

    dragStateRef.current = drag
    window.addEventListener('pointermove', drag.onMove)
    window.addEventListener('pointerup', drag.onUp)
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
        extraActions={
          type === 'skills' && isOwner && items.length > 0 ? (
            reordering ? (
              <Button variant="outline" className="px-3 py-1.5 text-[13px]" onClick={finishReorder} disabled={reorderSaving}>
                {reorderSaving ? 'Saving...' : 'Done'}
              </Button>
            ) : (
              <Button variant="outline" className="px-3 py-1.5 text-[13px]" onClick={startReorder}>
                <ListOrderedIcon className="h-3.5 w-3.5" />
                Reorder
              </Button>
            )
          ) : undefined
        }
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
        ) : type === 'skills' ? (
          <div className="flex flex-col gap-2">
            {type === 'skills' && items.length > 0 && (
              <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] px-4 py-3 text-sm text-[var(--text-secondary)]">
                I know {listFromType(profile, 'skills').map((s: Skill) => s.name).join(', ')}
              </div>
            )}
            {reordering && (
              <div className="mb-1 flex items-center justify-between gap-3 rounded-lg border border-[var(--accent)] bg-[var(--accent-soft)] px-3 py-2">
                <p className="text-[13px] font-medium text-[var(--accent)]">
                  Drag skills to reorder them, then save. You can only drag them up.
                </p>
                <Button variant="ghost" className="px-2 py-1 text-[13px]" onClick={cancelReorder}>
                  Cancel
                </Button>
              </div>
            )}

            {displayedSkills
              .slice(0, reordering || skillsExpanded ? displayedSkills.length : SKILLS_PER_PAGE)
              .map((skill) => (
              <div
                key={skill.id}
                data-skill-id={skill.id}
              >
                <ItemCard
                  isOwner={isOwner}
                  onEdit={() => openEdit(skill as unknown as Record<string, unknown>)}
                  onDelete={() => handleDelete(skill.id)}
                  dragHandle={reordering}
                  onGripPointerDown={(e) => startDrag(e, skill.id)}
                >
                  <RenderItem type={type} item={skill} />
                </ItemCard>
              </div>
            ))}

            {!reordering && !skillsExpanded && displayedSkills.length > SKILLS_PER_PAGE && (
              <Button
                variant="outline"
                className="mt-1 w-full justify-center"
                onClick={() => setSkillsExpanded(true)}
              >
                <ChevronDownIcon className="h-3.5 w-3.5" />
                More ({displayedSkills.length - SKILLS_PER_PAGE})
              </Button>
            )}
            {!reordering && skillsExpanded && displayedSkills.length > SKILLS_PER_PAGE && (
              <Button
                variant="outline"
                className="mt-1 w-full justify-center"
                onClick={() => setSkillsExpanded(false)}
              >
                <ChevronLeftIcon className="h-3.5 w-3.5" />
                Show less
              </Button>
            )}
            {reorderError && (
              <p className="text-sm text-red-500">{reorderError}</p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {(items as LanguageType[]).map((item) => (
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
