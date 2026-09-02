export const TOKEN_STORAGE_KEY = 'portfolio_tokens'

export const BACKEND_URL: string = (import.meta.env.VITE_BACKEND_URL as string | undefined)?.replace(/\/$/, '') ?? '/api'

export const CREATED_BY_LINK: string = (import.meta.env.VITE_CREATED_BY_LINK as string | undefined) ?? ''

export const BASE_URL = `${window.location.origin}`

export function getAssetUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${BASE_URL}/${path.replace(/^\//, '')}`
}
