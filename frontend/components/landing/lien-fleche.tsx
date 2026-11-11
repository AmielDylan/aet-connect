import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

// Un lien d'action : couleur du texte au repos ; au survol ou au focus, il passe en brun-roux et une flèche
// apparaît. La place de la flèche est réservée : rien ne bouge autour.
// `visible` : la flèche est toujours là (quand le lien s'aligne sur un bord) ; texte et flèche changent de couleur ensemble.
export function LienFleche({
  href,
  children,
  className = '',
  visible = false,
}: {
  href: string
  children: React.ReactNode
  className?: string
  visible?: boolean
}) {
  return (
    <Link
      href={href}
      className={`group inline-flex min-h-11 items-center gap-1.5 text-encre transition-colors duration-200 hover:text-terre focus-visible:text-terre ${className}`}
    >
      {children}
      <ArrowRight
        className={`size-[18px] ${
          visible
            ? ''
            : '-translate-x-1 opacity-0 transition-[opacity,translate] duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100'
        }`}
        aria-hidden="true"
      />
    </Link>
  )
}
