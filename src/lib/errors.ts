const FIELD_LABELS: Record<string, string> = {
  username: 'Username',
  first_name: 'First name',
  last_name: 'Last name',
  email: 'Email',
  password: 'Password',
  conf_password: 'Confirm password',
  current_password: 'Current password',
  new_password: 'New password',
  token: 'Token',
  code: 'Code',
  job: 'Job title',
  company: 'Company',
  activity: 'Activity',
  from_date: 'From date',
  to_date: 'To date',
  location: 'Location',
  language: 'Language',
  level: 'Level',
  issued_by: 'Issued by',
  name: 'Name',
  field: 'Field of study',
  edu_place: 'Institution',
  what_learnt: 'What you learned',
  certification: 'Certification',
  description: 'Description',
  technologies: 'Technologies',
  cover_image: 'Cover image',
  url: 'URL',
  job_title: 'Job title',
  summary: 'Summary',
  address: 'Address',
  phone_number: 'Phone number',
  website_url: 'Website URL',
  github_url: 'GitHub URL',
  linkedin_url: 'LinkedIn URL',
  behance_url: 'Behance URL',
  figma_url: 'Figma URL',
  profile_photo: 'Profile photo',
  credentials: 'Credentials',
  refresh: 'Refresh token',
}

function prettyField(field: string): string {
  return FIELD_LABELS[field] || field.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function isFieldErrors(data: unknown): data is Record<string, unknown> {
  if (!data || typeof data !== 'object') return false
  const obj = data as Record<string, unknown>
  return !('detail' in obj || 'message' in obj)
}

function messageFromValue(val: unknown): string {
  if (Array.isArray(val)) {
    if (val.length === 0) return ''
    return messageFromValue(val[0])
  }
  if (typeof val === 'string') return val
  if (typeof val === 'object' && val !== null) {
    const obj = val as Record<string, unknown>
    for (const v of Object.values(obj)) {
      const m = messageFromValue(v)
      if (m) return m
    }
  }
  return ''
}

export function extractError(err: unknown, fallback = 'Something went wrong'): string {
  const e = err as {
    response?: { data?: unknown }
    message?: string
  }

  const data = e.response?.data
  if (!data || typeof data !== 'object') return e.message || fallback

  if (isFieldErrors(data)) {
    const lines = Object.entries(data)
      .map(([field, val]) => {
        const msg = messageFromValue(val)
        if (!msg) return null
        return `${prettyField(field)}: ${msg}`
      })
      .filter((l): l is string => l !== null)
    if (lines.length > 0) return lines.join('\n')
  }

  const obj = data as Record<string, unknown>

  // DRF non-field errors: { detail: "message" }
  if (obj.detail) return String(obj.detail)

  // Wrapped error_response format: { success, message, data: { field: "error" } }
  if (obj.message && typeof obj.data === 'object' && obj.data !== null) {
    const d = obj.data as Record<string, unknown>
    if (Object.keys(d).length > 0) {
      return Object.entries(d)
        .map(([field, val]) => `${prettyField(field)}: ${messageFromValue(val)}`)
        .join('\n')
    }
  }

  if (obj.message) return String(obj.message)

  return e.message || fallback
}
