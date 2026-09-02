export const TOKEN_STORAGE_KEY = 'portfolio_tokens'

export const BASE_URL = `${window.location.origin}`

export function getAssetUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${BASE_URL}/${path.replace(/^\//, '')}`
}