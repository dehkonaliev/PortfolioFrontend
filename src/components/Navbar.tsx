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
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-700 dark:bg-gray-950/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <img
            src={theme === 'dark' ? '/favicon-dark/android-chrome-512x512.png' : '/favicon-light/android-chrome-512x512.png'}
            alt="Portfolio"
            className="h-9 w-9 rounded-xl object-cover"
          />
          <span className="font-display text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100">YourResume</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-2 sm:flex">
          {user ? (
            <>
              <Link
                to={`/${user.username}`}
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                My Page
              </Link>
              <div className="mx-2 h-6 w-px bg-gray-200 dark:bg-gray-700" />
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-lg bg-gray-100 py-1.5 pl-2 pr-2 transition hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                >
                  <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-indigo-500 text-xs font-bold text-white">
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
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {String(user.first_name || user.username)}
                  </span>
                  <ChevronDownIcon className={`h-4 w-4 transition ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
                    <Link
                      to="/settings"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                      <SettingsIcon />
                      Settings
                    </Link>
                    <Link
                      to={`/${user.username}/projects`}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                      <FolderIcon />
                      My Projects
                    </Link>
                    <div className="my-1 h-px bg-gray-200 dark:bg-gray-700" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <LogoutIcon />
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
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                Create account
              </Link>
            </>
          )}

          <button
            onClick={toggleTheme}
            title="Toggle theme"
            className="ml-1 rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>

        {/* Mobile: theme toggle + hamburger */}
        <div className="flex items-center gap-2 sm:hidden">
          <button
            onClick={toggleTheme}
            title="Toggle theme"
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
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
        <div className="border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-950 sm:hidden">
          <div className="space-y-1 px-4 py-3">
            {user ? (
              <>
                <div className="flex items-center gap-3 rounded-lg bg-gray-100 px-3 py-3 dark:bg-gray-800">
                  <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-indigo-500 text-base font-bold text-white">
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
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {String(user.first_name || user.username)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">@{String(user.username)}</p>
                  </div>
                </div>
                <Link
                  to={`/${user.username}`}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  My Page
                </Link>
                <Link
                  to={`/${user.username}/projects`}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  My Projects
                </Link>
                <Link
                  to="/settings"
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-500 transition hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="block rounded-lg bg-indigo-600 px-3 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-indigo-700"
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