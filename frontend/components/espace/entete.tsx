'use client'

// L'en-tête de l'espace membre, comme celui de l'accueil : la marque, la navigation, la recherche et le compte.
// Sous lg : un bouton « Menu » ouvre un panneau vert avec la recherche, la navigation et la déconnexion.
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronDown, Menu, X } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { espritFonts } from '@/lib/fonts'
import { useAuth } from '@/hooks/use-auth'
import { Brand } from '@/components/landing/site-header'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { FenetreRecherche, Recherche } from './recherche'
import { Portrait } from './portrait'

const NAV = [
  { label: 'Accueil', href: '/dashboard' },
  { label: 'Annuaire', href: '/dashboard/directory' },
  { label: 'Mes codes', href: '/dashboard/codes' },
  { label: 'Écoles', href: '/dashboard/schools' },
]

type LienAdmin = { label: string; href: string; badge?: number }

// Les menus déroulants s'ouvrent dans un portail, hors du conteneur qui porte les polices
const menuClasse = `${espritFonts} esprit font-texte min-w-56 rounded-2xl border-0 bg-creme p-2 text-encre shadow-xl`
const itemClasse = 'flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-3 text-base text-encre focus:bg-sable/60 focus:text-terre'

function Badge({ n, tone = 'creme' }: { n?: number; tone?: 'creme' | 'vert' }) {
  if (!n) return null
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${tone === 'vert' ? 'bg-or text-vert-nuit' : 'bg-terre text-creme'}`}>{n}</span>
  )
}

export function EnteteEspace() {
  const pathname = usePathname()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user, logout } = useAuth()
  const isAdmin = user?.role === 'admin'
  // Le menu est ouvert « sur » une page : changer de page le referme, sans effet à synchroniser
  const [ouvertSur, setOuvertSur] = useState<string | null>(null)
  const open = ouvertSur === pathname
  const setOpen = (v: boolean) => setOuvertSur(v ? pathname : null)
  const bouton = useRef<HTMLButtonElement>(null)

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => apiClient.getAdminStats(),
    enabled: isAdmin,
    refetchInterval: 30_000,
  })
  const demandes = stats?.overview.pendingRequests ?? 0
  const suppressions = stats?.overview.pendingDeletions ?? 0
  const ADMIN: LienAdmin[] = [
    { label: 'Vue d’ensemble', href: '/dashboard/admin' },
    { label: 'Demandes', href: '/dashboard/admin/pending', badge: demandes },
    { label: 'Membres', href: '/dashboard/admin/users' },
    { label: 'Écoles', href: '/dashboard/admin/schools' },
    { label: 'Suppressions', href: '/dashboard/admin/deletions', badge: suppressions },
    { label: 'Kit réseaux sociaux', href: '/dashboard/admin/kit' },
  ]

  // Un profil de membre s'ouvre depuis l'annuaire : « Annuaire » reste la page courante
  const actif = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href) || (href === '/dashboard/directory' && pathname.startsWith('/profile/'))
  const dansAdmin = pathname.startsWith('/dashboard/admin')

  // Échap ferme le menu et rend le focus au bouton
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOuvertSur(null)
        bouton.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const seDeconnecter = async () => {
    await logout()
    queryClient.clear()
    router.push('/login')
  }

  if (!user) return null

  return (
    <header className="sur-creme relative z-30">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link href="/dashboard" className="text-vert" aria-label="AET Connect, accueil de mon espace">
          <Brand />
        </Link>

        <nav aria-label="Mon espace" className="hidden items-center gap-7 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={actif(item.href) ? 'page' : undefined}
              className={`inline-flex min-h-11 items-center text-base transition-colors duration-200 hover:text-terre ${
                actif(item.href) && !dansAdmin ? 'text-vert underline decoration-terre decoration-2 underline-offset-8' : 'text-encre'
              }`}
            >
              {item.label}
            </Link>
          ))}
          {isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger
                className={`inline-flex min-h-11 items-center gap-2 text-base outline-none transition-colors duration-200 hover:text-terre data-[state=open]:text-terre ${
                  dansAdmin ? 'text-vert' : 'text-encre'
                }`}
              >
                {/* Le soulignement porte sur le mot seul : le nombre à côté n'est pas souligné */}
                <span className={dansAdmin ? 'underline decoration-terre decoration-2 underline-offset-8' : ''}>Administration</span>
                <Badge n={demandes + suppressions} />
                <ChevronDown className="size-4" aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className={menuClasse}>
                {ADMIN.map((item) => (
                  <DropdownMenuItem key={item.href} asChild className={itemClasse}>
                    <Link href={item.href} aria-current={pathname === item.href ? 'page' : undefined}>
                      <span className="flex-1">{item.label}</span>
                      <Badge n={item.badge} />
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <FenetreRecherche />
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex min-h-11 items-center gap-2 rounded-full text-base text-encre outline-none transition-colors hover:text-terre data-[state=open]:text-terre">
              <Portrait prenom={user.first_name} nom={user.last_name} src={user.avatar_url} className="size-9 rounded-full bg-vert text-xs text-creme" />
              {user.first_name}
              <ChevronDown className="size-4" aria-hidden="true" />
              <span className="sr-only">, menu du compte</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={menuClasse}>
              <div className="px-3 pb-2 pt-1">
                <p className="text-sm font-semibold text-vert">
                  {user.first_name} {user.last_name}
                </p>
                <p className="truncate text-sm text-olive">{user.email}</p>
              </div>
              <DropdownMenuItem asChild className={itemClasse}>
                <Link href="/dashboard/profile">Mon profil</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={seDeconnecter} className={itemClasse}>
                Se déconnecter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <button
          ref={bouton}
          type="button"
          aria-expanded={open}
          aria-controls="menu-espace"
          onClick={() => setOpen(!open)}
          className="inline-flex min-h-11 items-center gap-2 text-base text-vert lg:hidden"
        >
          {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          {open ? 'Fermer' : 'Menu'}
        </button>
      </div>

      {open && (
        <div
          id="menu-espace"
          className="sur-vert absolute inset-x-3 top-full grid max-h-[calc(100svh-5rem)] grid-cols-[minmax(0,1fr)] gap-6 overflow-y-auto rounded-3xl rounded-tr-[56px] bg-vert p-5 text-creme shadow-xl lg:hidden"
        >
          <Recherche tone="vert" onNavigate={() => setOpen(false)} />
          <nav aria-label="Mon espace" className="grid gap-6">
            <ul className="grid">
              {[...NAV, { label: 'Mon profil', href: '/dashboard/profile' }].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={actif(item.href) ? 'page' : undefined}
                    className={`flex min-h-12 items-center text-lg ${actif(item.href) ? 'text-or' : 'text-creme hover:text-or'}`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            {isAdmin && (
              <div className="grid gap-1">
                <p className="text-sm text-brume">Administration</p>
                <ul className="grid">
                  {ADMIN.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={pathname === item.href ? 'page' : undefined}
                        className={`flex min-h-12 items-center gap-3 text-lg ${pathname === item.href ? 'text-or' : 'text-creme hover:text-or'}`}
                      >
                        {item.label}
                        <Badge n={item.badge} tone="vert" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <button type="button" onClick={seDeconnecter} className="flex min-h-12 items-center text-lg text-brume hover:text-or">
              Se déconnecter
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}
