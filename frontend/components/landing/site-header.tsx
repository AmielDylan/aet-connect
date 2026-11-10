'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { LogIn, Menu, X } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Soleil } from './soleil'

const NAV = [
  { href: '#reseau', label: 'Le réseau' },
  { href: '#parcours', label: 'Comment rejoindre' },
]

/** La marque : le soleil aux neuf pétales et le nom */
export function Brand({ tone = 'clair' }: { tone?: 'clair' | 'sombre' }) {
  return (
    <span className="flex shrink-0 items-center gap-2 sm:gap-2.5">
      <Soleil className="size-8 sm:size-9" petales={tone === 'clair' ? 'fill-vert' : 'fill-creme'} coeur={tone === 'clair' ? 'fill-terre' : 'fill-or'} />
      <span className="whitespace-nowrap font-titre text-base font-semibold leading-none tracking-[-0.02em] sm:text-lg">AET Connect</span>
    </span>
  )
}

export function SiteHeader() {
  const { isAuthenticated } = useAuth()
  const [open, setOpen] = useState(false)
  const toggle = useRef<HTMLButtonElement>(null)
  const account = { href: isAuthenticated ? '/dashboard' : '/login', label: isAuthenticated ? 'Mon espace' : 'Se connecter' }

  // Échap ferme le menu et rend le focus au bouton
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggle.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="sur-creme relative z-30">
      <a
        href="#contenu"
        className="sr-only z-50 rounded-full bg-vert px-5 py-3 font-semibold text-creme focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
      >
        Aller au contenu
      </a>
      <nav aria-label="Principale" className="mx-auto flex max-w-[1280px] items-center justify-between gap-3 px-5 py-5 sm:gap-6 sm:px-8">
        <Link href="/" className="text-vert">
          <Brand />
        </Link>

        {/* Grand écran : les ancres, puis la connexion, un lien comme les autres marqué d'une icône */}
        <ul className="hidden items-center gap-9 text-base font-medium text-encre lg:flex">
          {NAV.map((item) => (
            <li key={item.href}>
              <a href={item.href} className="inline-flex min-h-11 items-center transition-colors duration-200 hover:text-terre">
                {item.label}
              </a>
            </li>
          ))}
          <li>
            <Link href={account.href} className="inline-flex min-h-11 items-center gap-2 font-semibold text-vert transition-colors duration-200 hover:text-terre">
              <LogIn className="size-[18px]" aria-hidden="true" />
              {account.label}
            </Link>
          </li>
        </ul>

        {/* Mobile et tablette : le menu */}
        <button
          ref={toggle}
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="menu-principal"
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-vert px-4 text-base font-semibold text-creme transition-colors duration-200 hover:bg-vert-carte lg:hidden"
        >
          {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          {open ? 'Fermer' : 'Menu'}
        </button>
      </nav>

      <div
        id="menu-principal"
        hidden={!open}
        className="sur-vert absolute inset-x-0 top-full mx-5 rounded-3xl bg-vert p-3 text-creme sm:mx-8 lg:hidden"
      >
        <ul className="grid">
          {NAV.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex min-h-14 items-center rounded-2xl px-4 font-titre text-lg font-semibold tracking-[-0.02em] transition-colors hover:bg-vert-carte"
              >
                {item.label}
              </a>
            </li>
          ))}
          <li>
            <Link
              href={account.href}
              onClick={() => setOpen(false)}
              className="flex min-h-14 items-center gap-3 rounded-2xl px-4 font-titre text-lg font-semibold tracking-[-0.02em] text-or transition-colors hover:bg-vert-carte"
            >
              <LogIn className="size-5" aria-hidden="true" />
              {account.label}
            </Link>
          </li>
        </ul>
      </div>
    </header>
  )
}
