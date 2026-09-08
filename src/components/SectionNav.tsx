import { useEffect, useState, useCallback } from 'react'
import {
  BriefcaseIcon,
  GraduationIcon,
  AwardIcon,
  GlobeIcon,
  FolderIcon,
  IdIcon,
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
  { id: 'contacts', label: 'Contacts', icon: <IdIcon className="h-4 w-4" />, sectionId: 'contacts' },
]

interface SectionNavProps {
  visibleSections: Set<string>
}

export default function SectionNav({ visibleSections }: SectionNavProps) {
  const [active, setActive] = useState<string>('experience')

  const filteredItems = NAV_ITEMS.filter((item) => visibleSections.has(item.sectionId))

  const handleScroll = useCallback(() => {
    const navHeight = 80
    const threshold = navHeight + 40

    const scrollHeight = document.documentElement.scrollHeight
    if (window.scrollY + window.innerHeight >= scrollHeight - 8) {
      const last = filteredItems[filteredItems.length - 1]
      if (last) {
        setActive(last.sectionId)
        return
      }
    }

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
    for (const offset of offsets) {
      if (offset.top <= threshold) {
        current = offset.id
      }
    }
    setActive(current)
  }, [filteredItems])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const scrollTo = (sectionId: string) => {
    const el = document.getElementById(sectionId)
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
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