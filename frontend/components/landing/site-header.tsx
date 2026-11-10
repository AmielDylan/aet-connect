'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { Soleil } from './soleil'

const NAV = [
  { href: '#reseau', label: 'Le réseau' },
  { href: '#parcours', label: 'Comment entrer' },
  { href: '#visibilite', label: 'Confidentialité' },
]

/** La marque : le soleil aux neuf pétales et le nom */
export function Brand({ tone = 'clair' }: { tone?: 'clair' | 'sombre' }) {
  return (
    <span className="flex items-center gap-2.5">
      <Soleil className="size-9" petales={tone === 'clair' ? 'fill-vert' : 'fill-creme'} coeur="fill-terre" />
      <span className="font-titre text-lg font-semibold leading-none tracking-[-0.02em]">AET Connect</span>
    </span>
  )
}

export function SiteHeader() {
  const { isAuthenticated } = useAuth()

  return (
    <header className="sur-creme">
      <a
        href="#contenu"
        className="sr-only z-50 rounded-full bg-vert px-5 py-3 font-semibold text-creme focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
      >
        Aller au contenu
      </a>
      <nav aria-label="Principale" className="mx-auto flex max-w-[1280px] items-center justify-between gap-6 px-5 py-5 sm:px-8">
        <Link href="/" className="text-vert">
          <Brand />
        </Link>

        <ul className="hidden items-center gap-8 text-base font-medium text-encre lg:flex">
          {NAV.map((item) => (
            <li key={item.href}>
              <a href={item.href} className="underline-offset-[6px] decoration-2 decoration-terre hover:underline">
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <Link
          href={isAuthenticated ? '/dashboard' : '/login'}
          className="inline-flex min-h-11 items-center rounded-full border-2 border-vert px-5 text-base font-semibold text-vert transition-colors duration-200 hover:bg-vert hover:text-creme"
        >
          {isAuthenticated ? 'Mon espace' : 'Se connecter'}
        </Link>
      </nav>
    </header>
  )
}
