import { useState } from "react"

type CoverImageProps = {
  alt: string
  className?: string
  loading?: "eager" | "lazy"
  src: string | null | undefined
}

export function CoverImage({ alt, className, loading = "lazy", src }: CoverImageProps) {
  const [broken, setBroken] = useState(false)

  if (!src || broken) {
    return <span>NO COVER</span>
  }

  return <img alt={alt} className={className} loading={loading} onError={() => setBroken(true)} src={src} />
}
