import { useEffect, useState } from 'react'
import Modal from './Modal'
import { Field, Input, Textarea, Button } from './ui'
import { getAssetUrl } from '../lib/constants'
import type {
  Experience,
  LanguageType,
  Skill,
  Education,
  Project,
} from '../types'

export type FormMode = 'create' | 'edit'

interface SectionFormModalProps {
  open: boolean
  onClose: () => void
  title: string
  formType: 'experience' | 'language' | 'skill' | 'education' | 'project'
  initial: Partial<Experience & LanguageType & Skill & Education & Project> | null
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  submitting: boolean
}

export default function SectionFormModal({
  open,
  onClose,
  title,
  formType,
  initial,
  onSubmit,
  submitting,
}: SectionFormModalProps) {
  const [form, setForm] = useState<Record<string, unknown>>({})
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...initial } : {})
      setError(null)
    }
  }, [open, initial])

  const set = (key: string, value: unknown) => setForm((prev) => ({ ...prev, [key]: value }))

  const reset = () => setForm({})

  const handleSubmit = async () => {
    setError(null)
    try {
      await onSubmit(form)
      reset()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    }
  }

  const skillLevels = [
    { min: 0, max: 20, label: 'Novice' },
    { min: 21, max: 40, label: 'Beginner' },
    { min: 41, max: 60, label: 'Intermediate' },
    { min: 61, max: 80, label: 'Advanced' },
    { min: 81, max: 100, label: 'Expert' },
  ]
  const skillLevelNames = skillLevels.map((l) => l.label).join(' / ')

  const skillLevelLabel = (pct: number) => {
    if (!pct) return 'Novice'
    return (skillLevels.find((l) => pct >= l.min && pct <= l.max) ?? skillLevels[skillLevels.length - 1]).label
  }

  const skillLevel = Math.max(0, Math.min(100, Number(form.level) || 0))

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="space-y-4">
        {(formType === 'experience') && (
          <>
            <Field label="Job Title">
              <Input value={(form.job as string) ?? ''} onChange={(e) => set('job', e.target.value)} required />
            </Field>
            <Field label="Company">
              <Input value={(form.company as string) ?? ''} onChange={(e) => set('company', e.target.value)} required />
            </Field>
            <Field label="Activity">
              <Textarea value={(form.activity as string) ?? ''} onChange={(e) => set('activity', e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="From">
                <Input type="date" value={(form.from_date as string) ?? ''} onChange={(e) => set('from_date', e.target.value)} />
              </Field>
              <Field label="To">
                <Input type="date" value={(form.to_date as string) ?? ''} onChange={(e) => set('to_date', e.target.value)} />
              </Field>
            </div>
            <Field label="Location">
              <Input value={(form.location as string) ?? ''} onChange={(e) => set('location', e.target.value)} />
            </Field>
          </>
        )}

        {formType === 'language' && (
          <>
            <Field label="Language">
              <Input value={(form.language as string) ?? ''} onChange={(e) => set('language', e.target.value)} required />
            </Field>
            <Field label="Level">
              <Input value={(form.level as string) ?? ''} onChange={(e) => set('level', e.target.value)} placeholder="e.g. Fluent, Intermediate" />
            </Field>
            <Field label="Issued By">
              <Input value={(form.issued_by as string) ?? ''} onChange={(e) => set('issued_by', e.target.value)} />
            </Field>
          </>
        )}

        {formType === 'skill' && (
          <>
            <Field label="Skill">
              <Input value={(form.name as string) ?? ''} onChange={(e) => set('name', e.target.value)} required />
            </Field>
            <Field label="Level (%)">
              <Input
                type="number"
                min={0}
                max={100}
                inputMode="numeric"
                value={form.level === '' || form.level == null ? '' : String(form.level)}
                onChange={(e) => set('level', Number(e.target.value))}
                placeholder="0-100"
              />
              <p className="mt-1.5 flex items-center gap-2 text-xs">
                <span className="font-medium text-indigo-600 dark:text-indigo-400">{skillLevelLabel(skillLevel)}</span>
                <span className="text-gray-300 dark:text-gray-600">·</span>
                <span className="text-gray-400 dark:text-gray-500">{skillLevelNames}</span>
              </p>
            </Field>
          </>
        )}

        {formType === 'education' && (
          <>
            <Field label="Field of Study">
              <Input value={(form.field as string) ?? ''} onChange={(e) => set('field', e.target.value)} required />
            </Field>
            <Field label="Institution">
              <Input value={(form.edu_place as string) ?? ''} onChange={(e) => set('edu_place', e.target.value)} required />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="From">
                <Input type="date" value={(form.from_date as string) ?? ''} onChange={(e) => set('from_date', e.target.value)} />
              </Field>
              <Field label="To">
                <Input type="date" value={(form.to_date as string) ?? ''} onChange={(e) => set('to_date', e.target.value)} />
              </Field>
            </div>
            <Field label="What You Learned">
              <Textarea value={(form.what_learnt as string) ?? ''} onChange={(e) => set('what_learnt', e.target.value)} />
            </Field>
            <Field label="Certification (Max 10MB)">
              <Input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) set('certification', file)
                }}
              />
            </Field>
          </>
        )}

        {formType === 'project' && (
          <>
            <Field label="Name">
              <Input value={(form.name as string) ?? ''} onChange={(e) => set('name', e.target.value)} required />
            </Field>
            <Field label="Description">
              <Textarea value={(form.description as string) ?? ''} onChange={(e) => set('description', e.target.value)} />
            </Field>
            <Field label="Technologies">
              <Input value={(form.technologies as string) ?? ''} onChange={(e) => set('technologies', e.target.value)} placeholder="Comma separated, e.g. React, Django" />
            </Field>
            <Field label="Cover Image (Max 5MB)">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) set('cover_image', file)
                }}
              />
              {typeof form.cover_image === 'string' && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Current image
                </p>
              )}
              {typeof form.cover_image === 'string' && (
                <img
                  src={getAssetUrl(form.cover_image) ?? ''}
                  alt="Current cover"
                  className="mt-2 h-24 w-40 rounded-lg border border-gray-200 object-cover dark:border-gray-700"
                />
              )}
            </Field>
            <Field label="URL">
              <Input value={(form.url as string) ?? ''} onChange={(e) => set('url', e.target.value)} placeholder="https://..." />
            </Field>
          </>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}