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

/** La marque : deux galons et le nom */
export function Brand({ tone = 'clair' }: { tone?: 'clair' | 'sombre' }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className={`grid size-9 place-items-center rounded-full ${tone === 'clair' ? 'bg-vert text-or' : 'bg-or text-vert-nuit'}`}>
        <Glyph name="galon" className="size-5" />
      </span>
      <span className="text-lg font-bold tracking-[-0.01em] [font-stretch:90%]">AET Connect</span>
    </span>
  )
}

export function SiteHeader() {
  const { isAuthenticated } = useAuth()

  return (
    <header>
      <a
        href="#contenu"
        className="sr-only z-50 rounded-full bg-or px-5 py-3 font-semibold text-vert-nuit focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
      >
        Aller au contenu
      </a>
      {/* Barre du haut : vert de nuit, l’onglet or donne l’accès direct par code */}
      <div className="bg-vert-nuit text-brume">
        <div className="mx-auto flex max-w-[1280px] items-stretch justify-between gap-4 pl-5 sm:pl-8">
          <p className="hidden items-center py-2.5 text-sm sm:flex">Réseau privé des Anciens Enfants de Troupe</p>
          <Link
            href="/register/with-code"
            className="group ml-auto inline-flex min-h-11 items-center gap-2 rounded-bl-2xl bg-or px-5 text-sm font-semibold text-vert-nuit"
          >
            Un ancien vous a envoyé un code{' '}? Entrez-le
            <ArrowRight className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <nav aria-label="Principale" className="sur-creme bg-creme">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-6 px-5 py-4 sm:px-8">
          <Link href="/" className="text-vert">
            <Brand />
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
