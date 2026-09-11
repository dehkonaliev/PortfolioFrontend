import type { PublicProfile, SocialLinks } from '../types'

interface ContactRow {
  key: string
  icon: React.ReactNode
  href?: string
  external?: boolean
  label: string
}

const STATIC_ICONS: Record<string, string> = {
  email: '/icons/email.png',
  phone: '/icons/phone.png',
  address: '/icons/location.png',
}

function PngIcon({ iconKey }: { iconKey: string }) {
  return <img src={STATIC_ICONS[iconKey]} alt="" className="h-4 w-4" />
}

function RowList({ rows }: { rows: ContactRow[] }) {
  return (
    <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
      {rows.map((c) => {
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
  )
}

export function ContactsSection({ profile }: { profile: PublicProfile }) {
  const contacts: ContactRow[] = []

  if (profile.email) {
    contacts.push({
      key: 'email',
      icon: <PngIcon iconKey="email" />,
      href: `mailto:${profile.email}`,
      label: profile.email,
    })
  }
  if (profile.phone_number) {
    contacts.push({
      key: 'phone',
      icon: <PngIcon iconKey="phone" />,
      href: `tel:${profile.phone_number}`,
      label: profile.phone_number,
    })
  }
  if (profile.address) {
    contacts.push({
      key: 'address',
      icon: <PngIcon iconKey="address" />,
      label: profile.address,
    })
  }

  if (contacts.length === 0) return null

  return (
    <section id="contacts" className="mb-6 mt-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-card)]">
      <h2 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Contacts</h2>
      <RowList rows={contacts} />
    </section>
  )
}

const SOCIAL_META: { key: keyof SocialLinks; file: string; label: string }[] = [
  { key: 'website_url', file: 'website.png', label: 'Website' },
  { key: 'github_url', file: 'github.png', label: 'GitHub' },
  { key: 'linkedin_url', file: 'linkedin.png', label: 'LinkedIn' },
  { key: 'telegram_url', file: 'telegram.png', label: 'Telegram' },
  { key: 'behance_url', file: 'behance.png', label: 'Behance' },
  { key: 'figma_url', file: 'figma.png', label: 'Figma' },
]

export function SocialLinksSection({ profile }: { profile: PublicProfile }) {
  const links: ContactRow[] = []

  if (profile.social_links) {
    for (const meta of SOCIAL_META) {
      const value = profile.social_links[meta.key]
      if (value) {
        links.push({
          key: meta.key,
          icon: <img src={`/icons/${meta.file}`} alt={meta.label} className="h-4 w-4" />,
          href: value,
          external: true,
          label: meta.label,
        })
      }
    }
  }

  if (links.length === 0) return null

  return (
    <section id="social-links" className="mb-6 mt-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-card)]">
      <h2 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Social Links</h2>
      <RowList rows={links} />
    </section>
  )
}

export default ContactsSection
