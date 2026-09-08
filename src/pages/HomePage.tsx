import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'
import api from '../api/axios'
import type { SearchUser, SearchProject } from '../types'
import { getAssetUrl } from '../lib/constants'
import { SearchIcon, BriefcaseIcon, FolderIcon, GraduationIcon, AwardIcon } from '../components/icons'

const FEATURES = [
  {
    icon: <BriefcaseIcon className="h-5 w-5" />,
    title: 'Showcase your journey',
    desc: 'Professional experience, timeline, and roles all in one place.',
  },
  {
    icon: <FolderIcon className="h-5 w-5" />,
    title: 'Portfolio of projects',
    desc: 'Highlight your best work with rich project pages and details.',
  },
  {
    icon: <GraduationIcon className="h-5 w-5" />,
    title: 'Credentials & skills',
    desc: 'Education, certifications, languages and fine-grained skill levels.',
  },
  {
    icon: <AwardIcon className="h-5 w-5" />,
    title: 'Get discovered',
    desc: 'Employers can search by skill, experience, or field to find you.',
  },
]

type Tab = 'filter' | 'people' | 'projects'

const TABS: { id: Tab; label: string }[] = [
  { id: 'filter', label: 'By role & skills' },
  { id: 'people', label: 'People' },
  { id: 'projects', label: 'Projects' },
]

interface FilterForm {
  name: string
  job_title: string
  skills: string
  experience: string
  education: string
}

export default function HomePage() {
  usePageTitle('MyResume — Find talent and projects')
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const initialTab = (searchParams.get('tab') as Tab) || 'filter'
  const initialQ = searchParams.get('q') ?? ''

  const [tab, setTab] = useState<Tab>(initialTab)
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)

  const [filterForm, setFilterForm] = useState<FilterForm>({
    name: searchParams.get('name') ?? '',
    job_title: searchParams.get('job_title') ?? '',
    skills: searchParams.get('skills') ?? '',
    experience: searchParams.get('experience') ?? '',
    education: searchParams.get('education') ?? '',
  })
  const [filterUsers, setFilterUsers] = useState<SearchUser[]>([])

  const [peopleQuery, setPeopleQuery] = useState(initialTab === 'people' ? initialQ : '')
  const [people, setPeople] = useState<SearchUser[]>([])

  const [projectQuery, setProjectQuery] = useState(initialTab === 'projects' ? initialQ : '')
  const [projects, setProjects] = useState<SearchProject[]>([])

  const setFilter = (key: keyof FilterForm, value: string) =>
    setFilterForm((prev) => ({ ...prev, [key]: value }))

  const runFilterSearch = async (form?: FilterForm) => {
    const f = form ?? filterForm
    const params = Object.entries(f).reduce<Record<string, string>>((acc, [k, v]) => {
      if (v.trim()) acc[k] = v.trim()
      return acc
    }, {})
    setSearchParams({ tab: 'filter', ...params })
    if (Object.keys(params).length === 0) {
      setFilterUsers([])
      setSearched(true)
      return
    }
    setSearching(true)
    try {
      const res = await api.get('/users/filter', { params })
      setFilterUsers(res.data?.data ?? [])
    } catch {
      setFilterUsers([])
    } finally {
      setSearching(false)
      setSearched(true)
    }
  }

  const runPeopleSearch = async (q?: string) => {
    const term = (q ?? peopleQuery).trim()
    setSearchParams({ tab: 'people', q: term })
    if (!term) {
      setPeople([])
      return
    }
    setSearching(true)
    try {
      const res = await api.get('/users/search', { params: { q: term } })
      setPeople(res.data?.data ?? [])
    } catch {
      setPeople([])
    } finally {
      setSearching(false)
      setSearched(true)
    }
  }

  const runProjectSearch = async (q?: string) => {
    const term = (q ?? projectQuery).trim()
    setSearchParams({ tab: 'projects', q: term })
    if (!term) {
      setProjects([])
      return
    }
    setSearching(true)
    try {
      const res = await api.get('/projects/search', { params: { q: term } })
      setProjects(res.data?.data ?? [])
    } catch {
      setProjects([])
    } finally {
      setSearching(false)
      setSearched(true)
    }
  }

  useEffect(() => {
    const t = searchParams.get('tab')
    if (t === 'filter') {
      const hasFilter = ['name', 'job_title', 'skills', 'experience', 'education'].some((k) => searchParams.get(k))
      if (hasFilter) void runFilterSearch()
    } else if (t === 'people') {
      const q = searchParams.get('q')
      if (q) void runPeopleSearch(q)
    } else if (t === 'projects') {
      const q = searchParams.get('q')
      if (q) void runProjectSearch(q)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const clearResults = () => {
    setSearched(false)
    setFilterUsers([])
    setPeople([])
    setProjects([])
    setSearchParams({})
  }

  const userCard = (u: SearchUser) => (
    <Link
      key={u.id}
      to={`/${u.username}`}
      className="group rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-card)] transition-colors hover:border-[var(--border-strong)]"
    >
      <div className="flex items-center gap-3">
        {u.profile_thumbnail || u.profile_photo ? (
          <img
            src={getAssetUrl(u.profile_thumbnail || u.profile_photo) ?? ''}
            alt={u.first_name || u.username}
            className="h-12 w-12 rounded-full object-cover border border-[var(--border-subtle)]"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg-surface-raised)] text-sm font-semibold text-[var(--text-tertiary)]">
            {(u.first_name || u.username).charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-[var(--text-primary)]">
            {[u.first_name, u.last_name].filter(Boolean).join(' ') || u.username}
          </h3>
          <p className="truncate text-[13px] text-[var(--text-tertiary)]">
            {u.job_title || `@${u.username}`}
          </p>
        </div>
      </div>
      {u.summary && (
        <p className="mt-3 line-clamp-2 text-[13px] text-[var(--text-secondary)]">{u.summary}</p>
      )}
      {u.matched_skills && u.matched_skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {u.matched_skills.map((s) => (
            <span
              key={s.id}
              className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] px-2 py-0.5 text-[11px] font-medium text-[var(--text-secondary)]"
            >
              {s.name}
            </span>
          ))}
        </div>
      )}
      <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-[var(--accent)] opacity-0 transition group-hover:opacity-100">
        View portfolio →
      </span>
    </Link>
  )

  const projectCard = (p: SearchProject) => (
    <article
      key={p.id}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-[var(--shadow-card)] transition-colors hover:border-[var(--border-strong)]"
    >
      <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-[var(--bg-surface-raised)]">
        {p.cover_image ? (
          <img
            src={getAssetUrl(p.cover_image) ?? ''}
            alt={p.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[var(--bg-surface-raised)] text-2xl font-semibold text-[var(--text-tertiary)]">
            {p.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 px-5 pt-4 pb-3">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          {p.url ? (
            <a href={p.url} target="_blank" rel="noopener noreferrer" className="transition hover:text-[var(--accent)]">{p.name}</a>
          ) : p.name}
        </h3>
        {p.description && (
          <p className="line-clamp-2 text-[13px] text-[var(--text-secondary)]">{p.description}</p>
        )}
        {p.technologies && (
          <p className="text-xs text-[var(--text-tertiary)]">{p.technologies}</p>
        )}
        <p className="text-xs text-[var(--text-tertiary)]">
          by {p.owner ? [p.owner.first_name, p.owner.last_name].filter(Boolean).join(' ') || p.owner.username : 'unknown'}
        </p>
      </div>
    </article>
  )

  const results = () => {
    if (tab === 'filter') return filterUsers
    if (tab === 'people') return people
    return projects
  }

  const renderResults = () => {
    const list = results()
    const isEmpty = list.length === 0
    return (
      <section className="mx-auto max-w-[1200px] px-6 pb-16 max-sm:px-4">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">
            {isEmpty ? 'No results' : `${list.length} result${list.length !== 1 ? 's' : ''}`}
          </h2>
          <button
            onClick={clearResults}
            className="text-[13px] font-medium text-[var(--accent)] hover:underline"
          >
            Clear search
          </button>
        </div>

        {isEmpty ? (
          <div className="rounded-xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-surface-raised)]/50 p-12 text-center">
            <SearchIcon className="mx-auto h-10 w-10 text-[var(--border-strong)]" />
            <p className="mt-3 text-sm text-[var(--text-tertiary)]">
              Nothing matched your search. Try different criteria.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tab === 'projects'
              ? (projects as SearchProject[]).map(projectCard)
              : (list as SearchUser[]).map(userCard)}
          </div>
        )}
      </section>
    )
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-[1200px] px-6 pt-20 pb-16 text-center sm:pt-28 sm:pb-20 max-sm:px-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] px-3.5 py-1 text-xs font-medium text-[var(--text-secondary)]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent)]" />
            Portfolios for every profession
          </span>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-5xl">
            Your professional story,
            <span className="block text-[var(--accent)]">
              beautifully told.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-[var(--text-secondary)]">
            Create a stunning resume and project portfolio that stands out. Get discovered
            by employers searching for talent across every field.
          </p>

          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {user ? (
              <Link
                to={`/${user.username}`}
                className="rounded-lg bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-[#0a0a0b] transition hover:opacity-90"
              >
                View my page
              </Link>
            ) : (
              <Link
                to="/login"
                className="rounded-lg bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-[#0a0a0b] transition hover:opacity-90"
              >
                Get started
              </Link>
            )}
            <Link
              to={user ? `/${user.username}` : '/login'}
              className="rounded-lg border border-[var(--border-subtle)] bg-transparent px-6 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
            >
              {user ? 'My portfolio' : 'Create portfolio'}
            </Link>
          </div>

          {/* Search */}
          <div className="mx-auto mt-12 max-w-2xl">
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-[var(--text-tertiary)]">
              Find talent, roles, and projects
            </label>

            {/* Tabs */}
            <div className="mb-3 inline-flex rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-0.5">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setTab(t.id); setSearched(false); setSearchParams({ tab: t.id }) }}
                  className={`rounded-md px-3 py-1.5 text-[13px] font-medium transition ${
                    tab === t.id
                      ? 'bg-[var(--accent)] text-[#0a0a0b]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]" />
                {tab === 'filter' && (
                  <input
                    value={filterForm.name}
                    onChange={(e) => setFilter('name', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && runFilterSearch()}
                    placeholder="Name (optional)"
                    className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] py-2.5 pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none transition focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20"
                  />
                )}
                {tab === 'people' && (
                  <input
                    value={peopleQuery}
                    onChange={(e) => setPeopleQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && runPeopleSearch()}
                    placeholder="Search people by name..."
                    className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] py-2.5 pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none transition focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20"
                  />
                )}
                {tab === 'projects' && (
                  <input
                    value={projectQuery}
                    onChange={(e) => setProjectQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && runProjectSearch()}
                    placeholder="Search projects by name or description..."
                    className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] py-2.5 pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none transition focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20"
                  />
                )}
              </div>
              <button
                onClick={() => {
                  if (tab === 'filter') runFilterSearch()
                  else if (tab === 'people') runPeopleSearch()
                  else runProjectSearch()
                }}
                disabled={searching}
                className="rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[#0a0a0b] transition hover:opacity-90 disabled:opacity-60"
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Filter panel */}
      {tab === 'filter' && (
        <section className="mx-auto -mt-4 max-w-3xl px-6 mb-10 max-sm:px-4">
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-card)]">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">
              Filter by (fill any — combined)
            </p>
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              <input
                value={filterForm.job_title}
                onChange={(e) => setFilter('job_title', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && runFilterSearch()}
                placeholder="Job title"
                className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none transition focus:border-[var(--accent)]"
              />
              <input
                value={filterForm.skills}
                onChange={(e) => setFilter('skills', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && runFilterSearch()}
                placeholder="Skills (comma separated)"
                className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none transition focus:border-[var(--accent)]"
              />
              <input
                value={filterForm.experience}
                onChange={(e) => setFilter('experience', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && runFilterSearch()}
                placeholder="Experience (job / company)"
                className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none transition focus:border-[var(--accent)]"
              />
              <input
                value={filterForm.education}
                onChange={(e) => setFilter('education', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && runFilterSearch()}
                placeholder="Education field"
                className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none transition focus:border-[var(--accent)]"
              />
            </div>
          </div>
        </section>
      )}

      {/* Search results */}
      {searched && renderResults()}

      {/* Features */}
      <section className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface-raised)]/30 py-20">
        <div className="mx-auto max-w-[1200px] px-6 max-sm:px-4">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
              Everything you need to shine
            </h2>
            <p className="mt-2 text-[var(--text-secondary)]">
              A complete toolkit to present your career and projects professionally.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 transition-colors hover:border-[var(--border-strong)]"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--bg-surface-raised)] text-[var(--text-tertiary)]">
                  {f.icon}
                </div>
                <h3 className="mt-3 text-sm font-semibold text-[var(--text-primary)]">{f.title}</h3>
                <p className="mt-1 text-[13px] text-[var(--text-secondary)]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-[1200px] px-6 py-20 max-sm:px-4">
        <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-10 text-center shadow-[var(--shadow-card)] sm:p-14">
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">Ready to build your portfolio?</h2>
          <p className="mx-auto mt-3 max-w-lg text-[var(--text-secondary)]">
            Join professionals across every field. Create your page in minutes and start getting discovered.
          </p>
          <Link
            to={user ? `/${user.username}` : '/login'}
            className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-[#0a0a0b] transition hover:opacity-90"
          >
            Create your portfolio →
          </Link>
        </div>
      </section>
    </div>
  )
}
