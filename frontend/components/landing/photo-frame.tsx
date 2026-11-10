import Image from 'next/image'
import type { Photo } from '@/lib/landing'

// Un cadre photo : noir et blanc au repos, la couleur revient au survol.
export function PhotoFrame({
  photo,
  className = '',
  position = 'center',
  sizes,
  priority = false,
}: {
  photo: Photo
  className?: string
  position?: string
  sizes: string
  priority?: boolean
}) {
  return (
    <div className={`photo-cadre relative overflow-hidden bg-sable ${className}`}>
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes={sizes}
        priority={priority}
        className="photo-nb object-cover"
        style={{ objectPosition: position }}
      />
    </div>
  )
}
