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

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.6)] dark:border-gray-700 dark:bg-gray-900 dark:hover:border-indigo-600">
      <div className="relative m-auto mt-3 aspect-video w-11/12 shrink-0 overflow-hidden rounded-lg transition-transform duration-300 ease-out group-hover:scale-105">
        {imageSrc ? (
          <img
            alt={name}
            loading="lazy"
            className="h-full w-full origin-center object-cover"
            src={imageSrc}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-500 text-4xl font-bold text-white">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-5 dark:text-white">
        <h3 className="line-clamp-3 text-justify text-base font-bold leading-snug text-gray-950 dark:text-white">
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              {name}
            </a>
          ) : (
            name
          )}
        </h3>
        {description && (
          <p className="line-clamp-4 text-justify text-sm leading-relaxed text-gray-500 dark:text-gray-300">
            {description}
          </p>
        )}
        {technologies && (
          <p className="text-xs text-gray-400 dark:text-gray-400">{technologies}</p>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-gray-100 px-5 py-2.5 dark:border-gray-800">
        <div className="flex items-center gap-1.5">
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950"
            >
              <LinkIcon className="h-3.5 w-3.5" />
              View project
            </a>
          )}
          {ownerUsername && (
            <Link
              to={ownerHref}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Owner's profile
            </Link>
          )}
        </div>

        {isOwner && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              aria-label="Edit"
              className="rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-indigo-400"
            >
              <EditIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              aria-label="Delete"
              className="rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-red-500 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-red-400"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </article>
  )
}
