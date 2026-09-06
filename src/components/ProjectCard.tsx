import { Link } from 'react-router-dom'
import { getAssetUrl } from '../lib/constants'
import { EditIcon, TrashIcon, LinkIcon } from './icons'

interface ProjectCardProps {
  name: string
  description?: string | null
  technologies?: string | null
  coverImage?: string | null
  url?: string | null
  ownerUsername?: string | null
  isOwner: boolean
  onEdit: () => void
  onDelete: () => void
}

export default function ProjectCard({
  name,
  description,
  technologies,
  coverImage,
  url,
  ownerUsername,
  isOwner,
  onEdit,
  onDelete,
}: ProjectCardProps) {
  const imageSrc = getAssetUrl(coverImage)
  const ownerHref = ownerUsername ? `/${ownerUsername}` : '#'
  const techList = technologies ? technologies.split(',').map((t) => t.trim()).filter(Boolean) : []

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-[var(--shadow-card)] transition-colors hover:border-[var(--border-strong)]">
      {/* Cover — full width, 16:9, rounded top */}
      <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-[var(--bg-surface-raised)]">
        {imageSrc ? (
          <img
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover"
            src={imageSrc}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[var(--bg-surface-raised)] text-2xl font-semibold text-[var(--text-tertiary)]">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 px-5 pt-4 pb-3">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-[var(--accent)]"
            >
              {name}
            </a>
          ) : (
            name
          )}
        </h3>
        {description && (
          <p className="text-[13px] leading-relaxed text-[var(--text-secondary)]">
            {description}
          </p>
        )}
        {techList.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1.5">
            {techList.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] px-2 py-0.5 text-[11px] font-medium text-[var(--text-secondary)]"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between border-t border-[var(--border-subtle)] px-5 py-2.5">
        <div className="flex items-center gap-2">
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--accent)] transition hover:opacity-80"
            >
              <LinkIcon className="h-3.5 w-3.5" />
              View project
            </a>
          )}
          {ownerUsername && (
            <>
              {url && <span className="h-3 w-px bg-[var(--border-subtle)]" />}
              <Link
                to={ownerHref}
                className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--text-tertiary)] transition hover:text-[var(--text-secondary)]"
              >
                Owner's profile
              </Link>
            </>
          )}
        </div>

        {isOwner && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onEdit() }}
              aria-label="Edit"
              className="rounded-lg p-1.5 text-[var(--text-tertiary)] transition hover:bg-[var(--bg-surface-raised)] hover:text-[var(--text-primary)]"
            >
              <EditIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete() }}
              aria-label="Delete"
              className="rounded-lg p-1.5 text-[var(--text-tertiary)] transition hover:bg-[var(--bg-surface-raised)] hover:text-red-500"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </article>
  )
}
