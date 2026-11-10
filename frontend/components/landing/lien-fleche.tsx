import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

// Un lien d'action : couleur du texte au repos ; au survol ou au focus, il passe en brun-roux et une flèche
// apparaît. La place de la flèche est réservée : rien ne bouge autour.
// Sur la carte or, le brun-roux est assombri (terre-fonce) pour garder 4,5:1.
export function LienFleche({
  href,
  children,
  surOr = false,
  className = '',
}: {
  href: string
  children: React.ReactNode
  surOr?: boolean
  className?: string
}) {
  return (
    <Link
      href={href}
      className={`group inline-flex min-h-11 items-center gap-1.5 font-semibold transition-colors duration-200 ${
        surOr ? 'text-vert-nuit hover:text-terre-fonce focus-visible:text-terre-fonce' : 'text-encre hover:text-terre focus-visible:text-terre'
      } ${className}`}
    >
      {children}
      <ArrowRight
        className="size-[18px] -translate-x-1 opacity-0 transition-[opacity,translate] duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
        aria-hidden="true"
      />
    </Link>
  )
}
