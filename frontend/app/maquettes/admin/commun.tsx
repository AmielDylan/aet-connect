'use client'

// Maquettes de la vue d'ensemble de l'administration : des chiffres et des demandes fictifs, à la forme de
// GET /api/admin/stats et des demandes d'accès et de suppression.
import Link from 'next/link'
import { ChevronDown, Search } from 'lucide-react'
import { Brand } from '@/components/landing/site-header'
import { Portrait } from '@/components/espace/portrait'

export const N = '\u00a0'
export const titre2 = 'font-titre text-xl font-semibold tracking-[-0.02em] text-vert'
export const boutonCreme =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-creme px-7 text-base font-semibold text-vert transition-colors duration-200 hover:bg-white'
export const boutonVert =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-vert px-7 text-base font-semibold text-creme transition-colors duration-200 hover:bg-vert-carte'

export const MOI = { first_name: 'Koffi', last_name: 'Mensah' }

export const STATS = {
  totalUsers: 128,
  newUsers: 6,
  totalCodes: 54,
  usedCodes: 31,
  pendingRequests: 3,
  totalRequests: 41,
  approvedRequests: 35,
  pendingDeletions: 1,
  roles: { alumni: 121, moderator: 3, admin: 4 },
  ecoles: [
    ['PMB', 34],
    ['EMPT', 27],
    ['PMS', 19],
    ['CME', 14],
    ['PMK (Kati)', 11],
    ['LMJF-GMK', 9],
    ['PMK', 7],
    ['PMN', 4],
    ['PML', 3],
  ] as [string, number][],
}

export type Demande = {
  id: string
  first_name: string
  last_name: string
  ecole: string
  pays: string
  entry_year: string
  message: string | null
  wants_ambassador: boolean
  created_at: string
}
const il = (jours: number) => new Date(Date.now() - jours * 86_400_000).toISOString()
export const DEMANDES: Demande[] = [
  {
    id: 'd1',
    first_name: 'Mariam',
    last_name: 'Coulibaly',
    ecole: 'PMK (Kati)',
    pays: 'Mali',
    entry_year: '2008',
    message: 'Personne de ma promo n’est encore inscrit ; je peux rassembler les autres.',
    wants_ambassador: true,
    created_at: il(0),
  },
  { id: 'd2', first_name: 'Jean-Baptiste', last_name: 'Ouédraogo', ecole: 'PMK', pays: 'Burkina Faso', entry_year: '1999', message: null, wants_ambassador: false, created_at: il(2) },
  {
    id: 'd3',
    first_name: 'Fatou',
    last_name: 'Diallo',
    ecole: 'PMS',
    pays: 'Sénégal',
    entry_year: '2012',
    message: 'Un collègue m’a parlé du réseau, mais son code a expiré.',
    wants_ambassador: false,
    created_at: il(5),
  },
]
export const SUPPRESSIONS = [{ id: 's1', name: 'Yao Kouassi', reason: 'Je n’utilise plus le site.', created_at: il(1) }]

/** « aujourd'hui », « hier », « il y a 5 jours » */
export function depuis(date: string) {
  const jours = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000))
  return new Intl.RelativeTimeFormat('fr', { numeric: 'auto' }).format(-jours, 'day')
}

/** Les membres par école, en barres : la plus grande école donne la longueur */
export function Barres({ surVert = false }: { surVert?: boolean }) {
  const max = Math.max(...STATS.ecoles.map(([, n]) => n))
  return (
    <ul className="grid gap-3">
      {STATS.ecoles.map(([ecole, n]) => (
        <li key={ecole} className="grid grid-cols-[6.5rem_minmax(0,1fr)_2.5rem] items-center gap-3 text-sm">
          <span className={surVert ? 'text-brume' : 'text-encre'}>{ecole}</span>
          <span className={`h-2.5 rounded-full ${surVert ? 'bg-creme/15' : 'bg-sable/70'}`}>
            <span className={`block h-full rounded-full ${surVert ? 'bg-or' : 'bg-vert'}`} style={{ width: `${(n / max) * 100}%` }} />
          </span>
          <span className={`text-right tabular-nums ${surVert ? 'text-creme' : 'text-encre'}`}>{n}</span>
        </li>
      ))}
    </ul>
  )
}

export function EnteteMaquette() {
  const n = STATS.pendingRequests + STATS.pendingDeletions
  return (
    <>
      <div className="bg-terre px-4 py-2 text-center text-sm text-creme">Maquette · chiffres et demandes fictifs</div>
      <header className="sur-creme">
        <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
          <span className="text-vert">
            <Brand />
          </span>
          <nav className="hidden items-center gap-7 lg:flex">
            {['Accueil', 'Annuaire', 'Mes codes', 'Écoles'].map((l) => (
              <Link key={l} href="#" className="inline-flex min-h-11 items-center text-base text-encre">
                {l}
              </Link>
            ))}
            <span className="inline-flex min-h-11 items-center gap-2 text-base text-vert underline decoration-terre decoration-2 underline-offset-8">
              Administration
              <span className="rounded-full bg-terre px-2 py-0.5 text-xs font-semibold tabular-nums text-creme no-underline">{n}</span>
              <ChevronDown className="size-4" aria-hidden="true" />
            </span>
          </nav>
          <span className="hidden items-center gap-2 lg:flex">
            <span className="grid size-11 place-items-center text-vert">
              <Search className="size-5" aria-hidden="true" />
            </span>
            <Portrait prenom={MOI.first_name} nom={MOI.last_name} className="size-9 rounded-full bg-vert text-xs text-creme" />
            <span className="text-base">{MOI.first_name}</span>
          </span>
          <span className="text-base text-vert lg:hidden">Menu</span>
        </div>
      </header>
    </>
  )
}
