import Image from 'next/image'
import type { Photo } from '@/lib/landing'

// Un cadre photo : noir et blanc au repos, la couleur revient au survol.
// `bulle` : un texte posé dans la bulle dessinée sur la photo (photo.bulle donne sa place). La bulle fait partie
// de l'image : même filtre, même zoom, et sa taille suit la largeur de l'image (unités cqw). Le cadre prend alors
// les proportions exactes de la photo, pour que rien ne soit rogné et que la bulle tombe toujours au bon endroit.
export function PhotoFrame({
  photo,
  className = '',
  position = 'center',
  sizes,
  priority = false,
  bulle,
}: {
  photo: Photo
  className?: string
  position?: string
  sizes: string
  priority?: boolean
  bulle?: string
}) {
  const ancre = bulle ? photo.bulle : undefined
  return (
    <div
      className={`photo-cadre relative overflow-hidden bg-sable ${className}`}
      style={ancre ? { aspectRatio: `${photo.width} / ${photo.height}` } : undefined}
    >
      <div className="photo-nb absolute inset-0 [container-type:inline-size]">
        <Image src={photo.src} alt={photo.alt} fill sizes={sizes} priority={priority} className="object-cover" style={{ objectPosition: position }} />
        {ancre && (
          <span
            aria-hidden="true"
            style={{ left: `${ancre.x}%`, top: `${ancre.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-[1.6cqw] bg-white px-[1.5cqw] py-[1.4cqw] font-texte text-[2.5cqw] font-semibold leading-none tracking-[0.03em] text-encre shadow-[0_0.4cqw_1.2cqw_rgb(0_0_0/0.18)] after:absolute after:left-[30%] after:top-[calc(100%-1px)] after:border-x-[0.8cqw] after:border-t-[1.1cqw] after:border-x-transparent after:border-t-white"
          >
            {bulle}
          </span>
        )}
      </div>
    </div>
  )
}
