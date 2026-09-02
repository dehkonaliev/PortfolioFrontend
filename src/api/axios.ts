import axios from 'axios'
import { TOKEN_STORAGE_KEY, BACKEND_URL } from '../lib/constants'

const api = axios.create({
  baseURL: BACKEND_URL,
})

function getToken(): string | null {
  try {
    const raw = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    return data?.access ?? null
  } catch {
    return null
  }
}

let isRefreshing = false
let refreshSubscribers: ((token: string | null) => void)[] = []

function onRefreshed(token: string | null) {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('/login') &&
      !original.url?.includes('/token/refresh')
    ) {
      original._retry = true

      let refreshToken: string | null = null
      try {
        const raw = localStorage.getItem(TOKEN_STORAGE_KEY)
        const data = raw ? JSON.parse(raw) : null
        refreshToken = data?.refresh ?? null
      } catch {
        refreshToken = null
      }

      if (!refreshToken) {
        localStorage.removeItem(TOKEN_STORAGE_KEY)
        // keep anonymous: resolve to allow public reads, reject only so caller can decide
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshSubscribers.push((token) => {
            if (token) {
              original.headers.Authorization = `Bearer ${token}`
              resolve(api(original))
            } else {
              reject(error)
            }
          })
        })
      }

      isRefreshing = true
      try {
        const res = await axios.post(`${BACKEND_URL}/token/refresh`, { refresh: refreshToken })
        const newAccess = res.data.access
        const stored = JSON.parse(localStorage.getItem(TOKEN_STORAGE_KEY) || '{}')
        const nextRefresh = res.data.refresh || stored.refresh
        localStorage.setItem(
          TOKEN_STORAGE_KEY,
          JSON.stringify({ access: newAccess, refresh: nextRefresh }),
        )
        onRefreshed(newAccess)
        original.headers.Authorization = `Bearer ${newAccess}`
        return api(original)
      } catch (refreshError) {
        localStorage.removeItem(TOKEN_STORAGE_KEY)
        onRefreshed(null)
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

export default api