import { useCallback, useEffect, useState } from 'react'
import api from '../api/axios'
import type { PublicProfile } from '../types'

export function usePublicProfile(username: string | undefined) {
  const [data, setData] = useState<PublicProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!username) {
        setLoading(false)
        setError(null)
        return
      }
      if (!options?.silent) setLoading(true)
      setError(null)
      try {
        const res = await api.get(`/user/${username}`)
        setData(res.data?.data ?? null)
      } catch {
        setError('User not found')
        setData(null)
      } finally {
        setLoading(false)
      }
    },
    [username],
  )

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return { data, loading, error, refetch: fetchProfile }
}