import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import {
  MoonIcon,
  SunIcon,
  LogoutIcon,
  SettingsIcon,
  ChevronDownIcon,
  FolderIcon,
} from './icons'
import { getAssetUrl } from '../lib/constants'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMobileOpen(false)
    setDropdownOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = async () => {
    setMobileOpen(false)
    setDropdownOpen(false)
    await logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)]/90">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-4 px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <img
            src={theme === 'dark' ? '/favicon-dark/android-chrome-512x512.png' : '/favicon-light/android-chrome-512x512.png'}
            alt="Portfolio"
            className="h-8 w-8 rounded-lg object-cover"
          />
          <span className="text-sm font-semibold tracking-tight text-[var(--text-primary)]">YourResume</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 sm:flex">
          {user ? (
            <>
              <Link
                to={`/${user.username}`}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--bg-surface-raised)] hover:text-[var(--text-primary)]"
              >
                My Page
              </Link>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] py-1 pl-1.5 pr-2 transition hover:border-[var(--border-strong)]"
                >
                  <span className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-[var(--bg-surface-raised)] text-[10px] font-semibold text-[var(--text-secondary)]">
                    {String(user.profile_thumbnail || '').trim() ? (
                      <img
                        src={getAssetUrl(String(user.profile_thumbnail || '')) ?? ''}
                        alt={String(user.username)}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      String(user.username || '?').charAt(0).toUpperCase()
                    )}
                  </span>
                  <span className="text-sm font-medium text-[var(--text-secondary)]">
                    {String(user.first_name || user.username)}
                  </span>
                  <ChevronDownIcon className={`h-3.5 w-3.5 text-[var(--text-tertiary)] transition ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] py-1 shadow-[var(--shadow-card)]">
                    <Link
                      to="/settings"
                      className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-[var(--text-secondary)] transition hover:bg-[var(--bg-surface-raised)] hover:text-[var(--text-primary)]"
                    >
                      <SettingsIcon className="h-4 w-4" />
                      Settings
                    </Link>
                    <Link
                      to={`/${user.username}/projects`}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-[var(--text-secondary)] transition hover:bg-[var(--bg-surface-raised)] hover:text-[var(--text-primary)]"
                    >
                      <FolderIcon className="h-4 w-4" />
                      My Projects
                    </Link>
                    <div className="my-1 h-px bg-[var(--border-subtle)]" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-red-500 transition hover:bg-red-500/10"
                    >
                      <LogoutIcon className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--bg-surface-raised)] hover:text-[var(--text-primary)]"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="rounded-lg bg-[var(--accent)] px-3.5 py-1.5 text-sm font-semibold text-[#0a0a0b] transition hover:opacity-90"
              >
                Create account
              </Link>
            </>
          )}

          <button
            onClick={toggleTheme}
            title="Toggle theme"
            className="ml-1 rounded-lg p-1.5 text-[var(--text-tertiary)] transition hover:bg-[var(--bg-surface-raised)] hover:text-[var(--text-primary)]"
          >
            {theme === 'dark' ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
          </button>
        </div>

        {/* Mobile: theme toggle + hamburger */}
        <div className="flex items-center gap-1 sm:hidden">
          <button
            onClick={toggleTheme}
            title="Toggle theme"
            className="rounded-lg p-1.5 text-[var(--text-tertiary)] transition hover:bg-[var(--bg-surface-raised)]"
          >
            {theme === 'dark' ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
            className="rounded-lg p-1.5 text-[var(--text-tertiary)] transition hover:bg-[var(--bg-surface-raised)]"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
              {mobileOpen ? (
                <path d="M18 6 6 18M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-canvas)] sm:hidden">
          <div className="space-y-0.5 px-4 py-2">
            {user ? (
              <>
                <div className="flex items-center gap-2.5 rounded-lg bg-[var(--bg-surface-raised)] px-3 py-2.5">
                  <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[var(--bg-surface)] text-xs font-semibold text-[var(--text-secondary)]">
                    {String(user.profile_thumbnail || '').trim() ? (
                      <img
                        src={getAssetUrl(String(user.profile_thumbnail || '')) ?? ''}
                        alt={String(user.username)}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      String(user.username || '?').charAt(0).toUpperCase()
                    )}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {String(user.first_name || user.username)}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)]">@{String(user.username)}</p>
                  </div>
                </div>
                <Link
                  to={`/${user.username}`}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--bg-surface-raised)] hover:text-[var(--text-primary)]"
                >
                  My Page
                </Link>
                <Link
                  to={`/${user.username}/projects`}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--bg-surface-raised)] hover:text-[var(--text-primary)]"
                >
                  My Projects
                </Link>
                <Link
                  to="/settings"
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--bg-surface-raised)] hover:text-[var(--text-primary)]"
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-500 transition hover:bg-red-500/10"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--bg-surface-raised)] hover:text-[var(--text-primary)]"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="block rounded-lg bg-[var(--accent)] px-3 py-2 text-center text-sm font-semibold text-[#0a0a0b]"
                >
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
