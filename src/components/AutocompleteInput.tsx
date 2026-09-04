import { useEffect, useRef, useState } from 'react'
import api from '../api/axios'

interface Suggestion {
  value: string
  usage_counts: number
}

interface AutocompleteInputProps {
  type: 'job_title' | 'technology' | 'field' | 'skill'
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  commaSeparated?: boolean
}

export default function AutocompleteInput({
  type,
  value,
  onChange,
  placeholder,
  required,
  commaSeparated = false,
}: AutocompleteInputProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  const currentToken = commaSeparated ? value.split(',').pop()?.trim() ?? '' : value

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  useEffect(() => {
    if (!open) return
    if (currentToken.length < 1) {
      setSuggestions([])
      return
    }
    let active = true
    setLoading(true)
    const id = window.setTimeout(async () => {
      try {
        const res = await api.get('/suggestions', {
          params: { type, q: currentToken },
        })
        if (!active) return
        const data = Array.isArray(res.data?.data) ? res.data.data : []
        setSuggestions(
          data
            .map((d: Record<string, unknown>) => ({
              value: String(d[Object.keys(d)[0]] ?? ''),
              usage_counts: Number(d.usage_counts ?? 0),
            }))
            .filter((s) => s.value),
        )
      } catch {
        if (active) setSuggestions([])
      } finally {
        if (active) setLoading(false)
      }
    }, 250)
    return () => {
      active = false
      window.clearTimeout(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentToken, type])

  const pick = (s: string) => {
    if (commaSeparated) {
      const parts = value.split(',')
      parts[parts.length - 1] = ` ${s}`
      onChange(parts.join(',').trim())
    } else {
      onChange(s)
    }
    setOpen(false)
  }

  return (
    <div ref={boxRef} className="relative">
      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none transition focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20"
      />
      {open && currentToken.length >= 1 && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] py-1 shadow-[var(--shadow-card)]">
          {loading && <div className="px-3 py-2 text-xs text-[var(--text-tertiary)]">Loading...</div>}
          {!loading && suggestions.length === 0 && (
            <div className="px-3 py-2 text-xs text-[var(--text-tertiary)]">No suggestions yet</div>
          )}
          {!loading &&
            suggestions.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => pick(s.value)}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm text-[var(--text-secondary)] transition hover:bg-[var(--bg-surface-raised)] hover:text-[var(--text-primary)]"
              >
                <span>{s.value}</span>
                <span className="shrink-0 text-xs text-[var(--text-tertiary)]">{s.usage_counts}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  )
}
