import { useEffect, useState, useCallback, useRef } from 'react'
import {
  BriefcaseIcon,
  GraduationIcon,
  AwardIcon,
  GlobeIcon,
  FolderIcon,
  IdIcon,
  Share2Icon,
} from './icons'

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  sectionId: string
}

const NAV_ITEMS: NavItem[] = [
  { id: 'experience', label: 'Experience', icon: <BriefcaseIcon className="h-4 w-4" />, sectionId: 'experience' },
  { id: 'education', label: 'Education', icon: <GraduationIcon className="h-4 w-4" />, sectionId: 'education' },
  { id: 'skills', label: 'Skills', icon: <AwardIcon className="h-4 w-4" />, sectionId: 'skills' },
  { id: 'languages', label: 'Languages', icon: <GlobeIcon className="h-4 w-4" />, sectionId: 'languages' },
  { id: 'projects', label: 'Projects', icon: <FolderIcon className="h-4 w-4" />, sectionId: 'projects' },
  { id: 'social-links', label: 'Social Links', icon: <Share2Icon className="h-4 w-4" />, sectionId: 'social-links' },
  { id: 'contacts', label: 'Contacts', icon: <IdIcon className="h-4 w-4" />, sectionId: 'contacts' },
]

interface SectionNavProps {
  visibleSections: Set<string>
}

export default function SectionNav({ visibleSections }: SectionNavProps) {
  const [active, setActive] = useState<string>('experience')
  const lockRef = useRef(false)
  const lockTimer = useRef<number | null>(null)

  const filteredItems = NAV_ITEMS.filter((item) => visibleSections.has(item.sectionId))

  const handleScroll = useCallback(() => {
    if (lockRef.current) return

    const threshold = 120
    const offsets: { id: string; top: number }[] = []
    for (const item of filteredItems) {
      const el = document.getElementById(item.sectionId)
      if (el) {
        const rect = el.getBoundingClientRect()
        offsets.push({ id: item.sectionId, top: rect.top })
      }
    }
    if (offsets.length === 0) return

    let current = offsets[0].id
    for (const o of offsets) {
      if (o.top <= threshold) current = o.id
    }

    const atBottom =
      window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8

    if (atBottom) {
      const lastTop = offsets[offsets.length - 1].top
      if (lastTop <= window.innerHeight / 2) {
        // The last section can actually be scrolled into the top half of the
        // viewport, so the user is reading it.
        current = offsets[offsets.length - 1].id
      } else {
        // The page is too short to scroll the last sections to the top.
        // Highlight the section sitting at the top of the viewport instead of
        // snapping to the last nav item (so "Social Links" stays highlighted
        // instead of jumping to "Contacts").
        let bestId = offsets[0].id
        let bestDis = Infinity
        for (const o of offsets) {
          const dis = Math.abs(o.top - threshold)
          if (o.top >= threshold && dis < bestDis) {
            bestDis = dis
            bestId = o.id
          }
        }
        current = bestId
      }
    }

    setActive(current)
  }, [filteredItems])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (lockTimer.current !== null) window.clearTimeout(lockTimer.current)
    }
  }, [handleScroll])

  const scrollTo = (sectionId: string) => {
    const el = document.getElementById(sectionId)
    if (!el) return
    setActive(sectionId)
    if (lockTimer.current !== null) window.clearTimeout(lockTimer.current)
    lockRef.current = true
    lockTimer.current = window.setTimeout(() => {
      lockRef.current = false
      lockTimer.current = null
      handleScroll()
    }, 700)
    const y = el.getBoundingClientRect().top + window.scrollY - 80
    window.scrollTo({ top: y, behavior: 'smooth' })
  }

  if (filteredItems.length === 0) return null

  return (
    <>
      {/* Desktop: sticky sidebar */}
      <aside className="no-print sticky top-20 hidden w-48 shrink-0 self-start lg:block" aria-label="Section navigation">
        <div className="flex flex-col gap-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2 shadow-[var(--shadow-card)]">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.sectionId)}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition ${
                active === item.sectionId
                  ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-raised)] hover:text-[var(--text-primary)]'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </aside>

      {/* Mobile: horizontal scrollable tabs */}
      <div className="no-scrollbar no-print sticky top-14 z-30 -mx-4 mb-4 overflow-x-auto border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)]/95 px-4 backdrop-blur-sm sm:hidden">
        <div className="flex gap-1 py-2">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.sectionId)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium transition ${
                active === item.sectionId
                  ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-raised)] hover:text-[var(--text-primary)]'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}