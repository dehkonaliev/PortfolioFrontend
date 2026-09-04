import type { PublicProfile } from '../types'
import {
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  LinkedinIcon,
  SendIcon,
} from './icons'

interface ContactRow {
  key: string
  icon: React.ReactNode
  href?: string
  external?: boolean
  label: string
}

export default function ContactsSection({ profile }: { profile: PublicProfile }) {
  const contacts: ContactRow[] = []

  if (profile.email) {
    contacts.push({
      key: 'email',
      icon: <MailIcon className="h-4 w-4" />,
      href: `mailto:${profile.email}`,
      label: profile.email,
    })
  }
  if (profile.phone_number) {
    contacts.push({
      key: 'phone',
      icon: <PhoneIcon className="h-4 w-4" />,
      href: `tel:${profile.phone_number}`,
      label: profile.phone_number,
    })
  }
  if (profile.address) {
    contacts.push({
      key: 'address',
      icon: <MapPinIcon className="h-4 w-4" />,
      label: profile.address,
    })
  }
  if (profile.linkedin_url) {
    contacts.push({
      key: 'linkedin',
      icon: <LinkedinIcon className="h-4 w-4" />,
      href: profile.linkedin_url,
      external: true,
      label: 'LinkedIn',
    })
  }
  if (profile.telegram_url) {
    contacts.push({
      key: 'telegram',
      icon: <SendIcon className="h-4 w-4" />,
      href: profile.telegram_url,
      external: true,
      label: 'Telegram',
    })
  }

  if (contacts.length === 0) return null

  return (
    <section id="contacts" className="mb-6 mt-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-card)]">
      <h2 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Contacts</h2>
      <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
        {contacts.map((c) => {
          const inner = (
            <>
              <span className="shrink-0 text-[var(--text-tertiary)]">{c.icon}</span>
              <span className="min-w-0 break-words">{c.label}</span>
            </>
          )
          return c.href ? (
            <li key={c.key}>
              <a
                href={c.href}
                {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="inline-flex max-w-full items-center gap-2 py-0.5 transition hover:text-[var(--accent)]"
              >
                {inner}
              </a>
            </li>
          ) : (
            <li key={c.key} className="inline-flex max-w-full items-center gap-2 py-0.5">
              {inner}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
