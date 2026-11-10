'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Glyph } from './bogolan'

const NAV = [
  { href: '#reseau', label: 'Le réseau' },
  { href: '#parcours', label: 'Comment entrer' },
  { href: '#visibilite', label: 'Confidentialité' },
]

export function SiteHeader() {
  const { isAuthenticated } = useAuth()

  return (
    <header>
      {/* Barre du haut : vert de nuit, l'onglet or donne l'accès direct par code */}
      <div className="bg-vert-nuit text-brume">
        <div className="mx-auto flex max-w-[1280px] items-stretch justify-between gap-4 pl-5 sm:pl-8">
          <p className="hidden items-center gap-2 py-2.5 text-sm sm:flex">
            <Glyph name="chevrons" className="size-4 text-or" />
            Annuaire panafricain des Anciens Enfants de Troupe, sur invitation
          </p>
          <Link
            href="/register/with-code"
            className="group ml-auto inline-flex min-h-10 items-center gap-2 rounded-bl-2xl bg-or px-5 text-sm font-semibold text-vert-nuit sm:min-h-11"
          >
            Un ancien vous a envoyé un code ? Entrez-le
            <ArrowRight className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <nav aria-label="Principale" className="sur-creme bg-creme">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-6 px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5 text-vert">
            <span className="grid size-9 place-items-center rounded-full bg-vert text-or">
              <Glyph name="chevrons" className="size-5" />
            </span>
            <span className="text-lg font-bold tracking-[-0.01em] [font-stretch:90%]">AET Connect</span>
          </Link>

          <ul className="hidden items-center gap-8 text-base font-medium text-encre lg:flex">
            {NAV.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="underline-offset-[6px] decoration-2 decoration-or hover:underline">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 sm:gap-5">
            <Link
              href={isAuthenticated ? '/dashboard' : '/login'}
              className="inline-flex min-h-11 items-center px-2 text-base font-semibold text-vert underline decoration-or decoration-2 underline-offset-[6px] hover:decoration-vert"
            >
              {isAuthenticated ? 'Mon espace' : 'Se connecter'}
            </Link>
            <a
              href="#rejoindre"
              className="hidden min-h-11 items-center rounded-full bg-vert px-5 text-base font-semibold text-or transition-colors duration-200 hover:bg-vert-carte sm:inline-flex"
            >
              Rejoindre ma promo
            </a>
          </div>
        </div>
      </nav>
    </header>
  )
}
