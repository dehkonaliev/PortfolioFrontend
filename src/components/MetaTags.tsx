import { Helmet } from 'react-helmet-async'
import { BASE_URL } from '../lib/constants'

interface MetaTagsProps {
  title: string
  description?: string | null
  image?: string | null
  url?: string
  type?: string
  extra?: React.ReactNode
}

function absoluteUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${BASE_URL}/${path.replace(/^\//, '')}`
}

export default function MetaTags({
  title,
  description,
  image,
  url,
  type = 'website',
  extra,
}: MetaTagsProps) {
  const resolvedUrl = url || `${BASE_URL}/`
  const resolvedImage = absoluteUrl(image)

  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={resolvedUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      {resolvedImage && <meta property="og:image" content={resolvedImage} />}
      <meta property="og:url" content={resolvedUrl} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      {description && <meta name="twitter:description" content={description} />}
      {resolvedImage && <meta name="twitter:image" content={resolvedImage} />}
      {extra}
    </Helmet>
  )
}
