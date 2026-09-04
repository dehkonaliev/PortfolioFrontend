import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { TOKEN_STORAGE_KEY } from '../lib/constants'
import api from '../api/axios'

interface AuthContextValue {
  user: Record<string, unknown> | null
  tokens: { access: string; refresh: string } | null
  login: (username: string, password: string) => Promise<void>
  signup: (data: SignupData) => Promise<void>
  requestVerification: (email: string) => Promise<string>
  verifyCode: (email: string, code: string) => Promise<string>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  setAuthUser: (user: UserData) => void
  deleteAccount: () => Promise<void>
}

export type UserData = {
  id: string
  username: string
  first_name: string
  last_name: string
  email: string
  job_title?: string | null
  profile_thumbnail?: string | null
}

export interface SignupData {
  email: string
  code: string
  verificationToken: string
  username: string
  first_name: string
  last_name: string
  password: string
  conf_password: string
}

interface StoredTokens {
  access?: string
  refresh?: string
  user?: Record<string, unknown> | null
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function readStoredTokens(): StoredTokens {
  try {
    const raw = localStorage.getItem(TOKEN_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Record<string, unknown> | null>(() => {
    return readStoredTokens().user ?? null
  })

  const [tokens, setTokens] = useState<{ access: string; refresh: string } | null>(
    () => {
      const stored = readStoredTokens()
      return stored.access && stored.refresh
        ? { access: stored.access, refresh: stored.refresh }
        : null
    },
  )

  const setAuthUser = useCallback((userData: UserData) => {
    const stored = readStoredTokens()
    const nextTokens = {
      access: stored.access || '',
      refresh: stored.refresh || '',
    }
    localStorage.setItem(
      TOKEN_STORAGE_KEY,
      JSON.stringify({
        access: nextTokens.access,
        refresh: nextTokens.refresh,
        user: userData,
      }),
    )
    setUser(userData as unknown as Record<string, unknown>)
    setTokens(nextTokens)
  }, [])

  const refreshUser = useCallback(async () => {
    const stored = readStoredTokens()
    if (!stored.access) return
    try {
      const res = await api.get('/me')
      const data = res.data?.data
      if (data) {
        const normalized = {
          id: data.id,
          username: data.username,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          job_title: data.job_title,
          profile_thumbnail: data.profile_thumbnail,
        }
        const latest = readStoredTokens()
        localStorage.setItem(
          TOKEN_STORAGE_KEY,
          JSON.stringify({
            access: latest.access,
            refresh: latest.refresh,
            user: normalized,
          }),
        )
        setUser(normalized as unknown as Record<string, unknown>)
      }
    } catch {
      // keep anonymous if refresh fails
    }
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const res = await api.post('/login', { username, password })
    const data = res.data?.data
    const access = data?.tokens?.access
    const refresh = data?.tokens?.refresh
    const userData = data?.user ?? null
    if (!access || !refresh) {
      throw new Error('Invalid login response')
    }
    localStorage.setItem(
      TOKEN_STORAGE_KEY,
      JSON.stringify({ access, refresh, user: userData }),
    )
    setTokens({ access, refresh })
    setUser(userData)
    void refreshUser()
  }, [refreshUser])

  const logout = useCallback(async () => {
    const stored = readStoredTokens()
    try {
      if (stored.refresh) {
        await api.post('/logout', { refresh: stored.refresh })
      }
    } catch {
      // ignore logout errors
    }
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    setTokens(null)
    setUser(null)
  }, [])

  const requestVerification = useCallback(async (email: string) => {
    const res = await api.post('/signup', { email })
    return res.data?.message || 'Verification code sent'
  }, [])

  const verifyCode = useCallback(async (email: string, code: string) => {
    const res = await api.post('/verify-code', { email, code })
    const token = res.data?.data?.token
    if (!token) {
      throw new Error('Verification failed')
    }
    return token as string
  }, [])

  const signup = useCallback(async (data: SignupData) => {
    const verificationToken = await verifyCode(data.email, data.code)
    await api.post('/create-account', {
      token: verificationToken,
      username: data.username,
      first_name: data.first_name,
      last_name: data.last_name,
      password: data.password,
      conf_password: data.conf_password,
    })
    await login(data.username, data.password)
  }, [verifyCode, login])

  const deleteAccount = useCallback(async () => {
    await api.delete('/delete-account')
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    setTokens(null)
    setUser(null)
  }, [])

  useEffect(() => {
    if (tokens?.access) {
      void refreshUser()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokens?.access])

  const value = useMemo(
    () => ({ user, tokens, login, signup, requestVerification, verifyCode, logout, refreshUser, setAuthUser, deleteAccount }),
    [user, tokens, login, signup, requestVerification, verifyCode, logout, refreshUser, setAuthUser, deleteAccount],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}