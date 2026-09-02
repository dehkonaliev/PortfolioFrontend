import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'
import api from '../api/axios'
import type { SearchUser, SearchProject } from '../types'
import { getAssetUrl } from '../lib/constants'
import { SearchIcon, BriefcaseIcon, FolderIcon, GraduationIcon, AwardIcon, LinkIcon } from '../components/icons'

const FEATURES = [
  {
    icon: <BriefcaseIcon className="h-6 w-6" />,
    title: 'Showcase your journey',
    desc: 'Professional experience, timeline, and roles all in one place.',
  },
  {
    icon: <FolderIcon className="h-6 w-6" />,
    title: 'Portfolio of projects',
    desc: 'Highlight your best work with rich project pages and details.',
  },
  {
    icon: <GraduationIcon className="h-6 w-6" />,
    title: 'Credentials & skills',
    desc: 'Education, certifications, languages and fine-grained skill levels.',
  },
  {
    icon: <AwardIcon className="h-6 w-6" />,
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
  usePageTitle('YourResume — Find talent and projects')
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
      className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-900 dark:hover:border-indigo-700"
    >
      <div className="flex items-center gap-3">
        {u.profile_thumbnail || u.profile_photo ? (
          <img
            src={getAssetUrl(u.profile_thumbnail || u.profile_photo) ?? ''}
            alt={u.first_name || u.username}
            className="h-14 w-14 rounded-full object-cover ring-2 ring-indigo-100 dark:ring-indigo-900/40"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-lg font-bold text-white">
            {(u.first_name || u.username).charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-gray-900 dark:text-gray-100">
            {[u.first_name, u.last_name].filter(Boolean).join(' ') || u.username}
          </h3>
          <p className="truncate text-sm text-gray-500 dark:text-gray-400">
            {u.job_title || `@${u.username}`}
          </p>
        </div>
      </div>
      {u.summary && (
        <p className="mt-3 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">{u.summary}</p>
      )}
      {u.matched_skills && u.matched_skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {u.matched_skills.map((s) => (
            <span
              key={s.id}
              className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
            >
              {s.name}
            </span>
          ))}
        </div>
      )}
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 opacity-0 transition group-hover:opacity-100 dark:text-indigo-400">
        View portfolio →
      </span>
    </Link>
  )

  const projectCard = (p: SearchProject) => (
    <article
      key={p.id}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.6)] dark:border-gray-700 dark:bg-gray-900 dark:hover:border-indigo-600"
    >
      <div className="relative m-auto mt-3 aspect-video w-11/12 shrink-0 overflow-hidden rounded-lg transition-transform duration-300 ease-out group-hover:scale-105">
        {p.cover_image ? (
          <img
            src={getAssetUrl(p.cover_image) ?? ''}
            alt={p.name}
            loading="lazy"
            className="h-full w-full origin-center object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-500 text-4xl font-bold text-white">
            {p.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-5 dark:text-white">
        <h3 className="line-clamp-3 text-justify text-base font-bold leading-snug text-gray-950 dark:text-white">
          {p.url ? (
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              {p.name}
            </a>
          ) : (
            p.name
          )}
        </h3>
        {p.description && (
          <p className="line-clamp-4 text-justify text-sm leading-relaxed text-gray-500 dark:text-gray-300">
            {p.description}
          </p>
        )}
        {p.technologies && (
          <p className="text-xs text-gray-400 dark:text-gray-400">{p.technologies}</p>
        )}
        <p className="text-xs text-gray-400 dark:text-gray-500">
          by {p.owner ? [p.owner.first_name, p.owner.last_name].filter(Boolean).join(' ') || p.owner.username : 'unknown'}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-gray-100 px-5 py-2.5 dark:border-gray-800">
        <div className="flex items-center gap-1.5">
          {p.url && (
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950"
            >
              <LinkIcon className="h-3.5 w-3.5" />
              View project
            </a>
          )}
          {p.owner?.username && (
            <Link
              to={`/${p.owner.username}`}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Owner's profile
            </Link>
          )}
        </div>
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
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {isEmpty ? 'No results' : `${list.length} result${list.length !== 1 ? 's' : ''}`}
          </h2>
          <button
            onClick={clearResults}
            className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Clear search
          </button>
        </div>

        {isEmpty ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white/50 p-12 text-center dark:border-gray-700 dark:bg-gray-900/50">
            <SearchIcon className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
            <p className="mt-4 text-gray-500 dark:text-gray-400">
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
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-500/20" />
          <div className="absolute left-1/4 top-1/2 h-72 w-72 rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-500/10" />
        </div>

        <div className="mx-auto max-w-6xl px-4 pt-20 pb-16 text-center sm:pt-28 sm:pb-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-500" />
            Portfolios for every profession
          </span>

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-6xl">
            Your professional story,
            <span className="block bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              beautifully told.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-500 dark:text-gray-400">
            Create a stunning resume and project portfolio that stands out. Get discovered
            by employers searching for talent across every field.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {user ? (
              <Link
                to={`/${user.username}`}
                className="rounded-full bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-700 hover:shadow-indigo-600/40"
              >
                View my page
              </Link>
            ) : (
              <Link
                to="/login"
                className="rounded-full bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-700 hover:shadow-indigo-600/40"
              >
                Get started
              </Link>
            )}
            <Link
              to={user ? `/${user.username}` : '/login'}
              className="rounded-full border border-gray-300 bg-white px-8 py-3.5 text-base font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              {user ? 'My portfolio' : 'Create portfolio'}
            </Link>
          </div>

          {/* Search */}
          <div className="mx-auto mt-14 max-w-3xl">
            <label className="mb-3 block text-sm font-medium text-gray-500 dark:text-gray-400">
              Find talent, roles, and projects
            </label>

            {/* Tabs */}
            <div className="mb-4 inline-flex rounded-full border border-gray-200 bg-white p-1 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setTab(t.id); setSearched(false); setSearchParams({ tab: t.id }) }}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                    tab === t.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                {tab === 'filter' && (
                  <input
                    value={filterForm.name}
                    onChange={(e) => setFilter('name', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && runFilterSearch()}
                    placeholder="Name (optional)"
                    className="w-full rounded-full border border-gray-300 bg-white py-3.5 pl-11 pr-4 text-gray-900 placeholder-gray-400 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  />
                )}
                {tab === 'people' && (
                  <input
                    value={peopleQuery}
                    onChange={(e) => setPeopleQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && runPeopleSearch()}
                    placeholder="Search people by name..."
                    className="w-full rounded-full border border-gray-300 bg-white py-3.5 pl-11 pr-4 text-gray-900 placeholder-gray-400 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  />
                )}
                {tab === 'projects' && (
                  <input
                    value={projectQuery}
                    onChange={(e) => setProjectQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && runProjectSearch()}
                    placeholder="Search projects by name or description..."
                    className="w-full rounded-full border border-gray-300 bg-white py-3.5 pl-11 pr-4 text-gray-900 placeholder-gray-400 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
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
                className="rounded-full bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Filter panel (advanced criteria) */}
      {tab === 'filter' && (
        <section className="mx-auto -mt-6 max-w-4xl px-4 mb-10">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Filter by (fill any — combined)
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <input
                value={filterForm.job_title}
                onChange={(e) => setFilter('job_title', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && runFilterSearch()}
                placeholder="Job title"
                className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              />
              <input
                value={filterForm.skills}
                onChange={(e) => setFilter('skills', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && runFilterSearch()}
                placeholder="Skills (comma separated)"
                className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              />
              <input
                value={filterForm.experience}
                onChange={(e) => setFilter('experience', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && runFilterSearch()}
                placeholder="Experience (job / company)"
                className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              />
              <input
                value={filterForm.education}
                onChange={(e) => setFilter('education', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && runFilterSearch()}
                placeholder="Education field"
                className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>
          </div>
        </section>
      )}

      {/* Search results */}
      {searched && renderResults()}

      {/* Features */}
      <section className="border-t border-gray-200 bg-white py-20 dark:border-gray-700 dark:bg-gray-900/50">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
              Everything you need to shine
            </h2>
            <p className="mt-3 text-gray-500 dark:text-gray-400">
              A complete toolkit to present your career and projects professionally.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-gray-200 bg-gray-50 p-6 transition hover:border-indigo-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-900 dark:hover:border-indigo-800"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-900/40 dark:text-indigo-300">
                  {f.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-600 p-12 text-center shadow-xl sm:p-16">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Ready to build your portfolio?</h2>
            <p className="mx-auto mt-4 max-w-xl text-indigo-100">
              Join professionals across every field. Create your page in minutes and start getting discovered.
            </p>
            <Link
              to={user ? `/${user.username}` : '/login'}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-semibold text-indigo-700 shadow-lg transition hover:bg-indigo-50"
            >
              Create your portfolio →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
