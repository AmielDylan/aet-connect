'use client'

// Maquettes de la page des membres (administration) : des membres fictifs, à la forme de GET /api/admin/users,
// et un état local qui imite les changements de rôle, le statut d'ambassadeur et la suppression.
import { useId, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, ChevronDown, Search } from 'lucide-react'
import { Brand } from '@/components/landing/site-header'
import { Portrait } from '@/components/espace/portrait'

import { Filtres } from '@/components/espace/administration'
export { Filtres, N, boutonAlerte, boutonVert, lienAlerte, lienSimple, depuis, de } from '@/components/espace/administration'

export const titre2 = 'font-titre text-xl font-semibold tracking-[-0.02em] text-vert'

export type Role = 'alumni' | 'moderator' | 'admin'
export const ROLES: { valeur: Role; texte: string; court: string; pluriel: string; plurielCourt: string }[] = [
  { valeur: 'alumni', texte: 'Membre', court: 'Membre', pluriel: 'Membres', plurielCourt: 'Memb.' },
  { valeur: 'moderator', texte: 'Modérateur', court: 'Modér.', pluriel: 'Modérateurs', plurielCourt: 'Modér.' },
  { valeur: 'admin', texte: 'Administrateur', court: 'Admin.', pluriel: 'Administrateurs', plurielCourt: 'Admin.' },
]
export const libelleRole = (r: Role) => ROLES.find((x) => x.valeur === r)!.texte

export type Membre = {
  id: string
  first_name: string
  last_name: string
  email: string
  ecole: string
  pays: string
  entry_year: string
  current_city: string | null
  role: Role
  is_ambassador: boolean
  max_codes_allowed: number
  codes_utilises: number
  created_at: string
}

const il = (jours: number) => new Date(Date.now() - jours * 86_400_000).toISOString()
export const MOI_ID = 'm1'
const DEPART: Membre[] = [
  { id: 'm1', first_name: 'Koffi', last_name: 'Mensah', email: 'koffi.mensah@exemple.bj', ecole: 'PMB', pays: 'Côte d’Ivoire', entry_year: '1996', current_city: 'Cotonou', role: 'admin', is_ambassador: false, max_codes_allowed: 999, codes_utilises: 24, created_at: il(320) },
  { id: 'm2', first_name: 'Aminata', last_name: 'Touré', email: 'aminata.toure@exemple.bf', ecole: 'PMK', pays: 'Burkina Faso', entry_year: '1999', current_city: 'Ouagadougou', role: 'alumni', is_ambassador: true, max_codes_allowed: 15, codes_utilises: 9, created_at: il(210) },
  { id: 'm3', first_name: 'Jean-Baptiste', last_name: 'Ouédraogo', email: 'jb.ouedraogo@exemple.bf', ecole: 'PMK', pays: 'Burkina Faso', entry_year: '1999', current_city: 'Paris', role: 'alumni', is_ambassador: false, max_codes_allowed: 3, codes_utilises: 1, created_at: il(2) },
  { id: 'm4', first_name: 'Mariam', last_name: 'Coulibaly', email: 'mariam.coulibaly@exemple.ml', ecole: 'PMK (Kati)', pays: 'Mali', entry_year: '2008', current_city: 'Bamako', role: 'alumni', is_ambassador: false, max_codes_allowed: 3, codes_utilises: 0, created_at: il(1) },
  { id: 'm5', first_name: 'Serge', last_name: 'Kouamé', email: 'serge.kouame@exemple.ci', ecole: 'EMPT', pays: 'Côte d’Ivoire', entry_year: '2003', current_city: 'Abidjan', role: 'moderator', is_ambassador: true, max_codes_allowed: 15, codes_utilises: 6, created_at: il(150) },
  { id: 'm6', first_name: 'Awa', last_name: 'Ndiaye', email: 'awa.ndiaye@exemple.sn', ecole: 'PMS', pays: 'Sénégal', entry_year: '2010', current_city: 'Dakar', role: 'alumni', is_ambassador: false, max_codes_allowed: 3, codes_utilises: 3, created_at: il(40) },
  { id: 'm7', first_name: 'Ibrahim', last_name: 'Diallo', email: 'ibrahim.diallo@exemple.gn', ecole: 'PMS', pays: 'Sénégal', entry_year: '2010', current_city: 'Conakry', role: 'alumni', is_ambassador: true, max_codes_allowed: 15, codes_utilises: 4, created_at: il(95) },
  { id: 'm8', first_name: 'Fatou', last_name: 'Sow', email: 'fatou.sow@exemple.sn', ecole: 'LMJF-GMK', pays: 'Sénégal', entry_year: '2014', current_city: 'Lyon', role: 'admin', is_ambassador: false, max_codes_allowed: 999, codes_utilises: 12, created_at: il(280) },
  { id: 'm9', first_name: 'Yao', last_name: 'Kouassi', email: 'yao.kouassi@exemple.ci', ecole: 'PMB', pays: 'Côte d’Ivoire', entry_year: '2001', current_city: null, role: 'alumni', is_ambassador: false, max_codes_allowed: 3, codes_utilises: 2, created_at: il(60) },
  { id: 'm10', first_name: 'Rokia', last_name: 'Traoré', email: 'rokia.traore@exemple.ml', ecole: 'PMK (Kati)', pays: 'Mali', entry_year: '2008', current_city: 'Montréal', role: 'alumni', is_ambassador: false, max_codes_allowed: 3, codes_utilises: 0, created_at: il(8) },
  { id: 'm11', first_name: 'Paul', last_name: 'Agbo', email: 'paul.agbo@exemple.bj', ecole: 'CME', pays: 'Bénin', entry_year: '2005', current_city: 'Porto-Novo', role: 'alumni', is_ambassador: false, max_codes_allowed: 3, codes_utilises: 1, created_at: il(18) },
  { id: 'm12', first_name: 'Hawa', last_name: 'Keïta', email: 'hawa.keita@exemple.ml', ecole: 'PMN', pays: 'Niger', entry_year: '2012', current_city: 'Niamey', role: 'alumni', is_ambassador: false, max_codes_allowed: 3, codes_utilises: 0, created_at: il(4) },
]

export const nom = (m: { first_name: string; last_name: string }) => `${m.first_name} ${m.last_name}`
const memePromo = (a: Membre, b: Membre) => a.ecole === b.ecole && a.entry_year === b.entry_year

/** Quota par défaut : 3 invitations, 15 pour un ambassadeur, sans limite pour un administrateur */
const quota = (role: Role, amb: boolean) => (role === 'admin' ? 999 : amb ? 15 : 3)

export type Filtre = 'tous' | Role | 'ambassadeurs'

/** Les membres, la recherche et les changements, en mémoire */
export function useMembres() {
  const [membres, setMembres] = useState(DEPART)
  const [recherche, setRecherche] = useState('')
  const [filtre, setFiltre] = useState<Filtre>('tous')
  const [ecole, setEcole] = useState('')

  const t = recherche.trim().toLowerCase()
  // Les nombres des filtres portent sur la recherche et l'école choisies
  const trouves = membres.filter((m) => (!t || `${nom(m)} ${m.email}`.toLowerCase().includes(t)) && (!ecole || m.ecole === ecole))
  const garde = (m: Membre, f: Filtre) => f === 'tous' || (f === 'ambassadeurs' ? m.is_ambassador : m.role === f)
  const visibles = trouves.filter((m) => garde(m, filtre))
  const maj = (id: string, p: Partial<Membre>) => setMembres((l) => l.map((m) => (m.id === id ? { ...m, ...p } : m)))

  return {
    membres,
    visibles,
    recherche,
    setRecherche,
    filtre,
    setFiltre,
    ecole,
    setEcole,
    ecoles: [...new Set(membres.map((m) => m.ecole))].sort(),
    compte: (f: Filtre) => trouves.filter((m) => garde(m, f)).length,
    /** L'ambassadeur de sa promo, si c'est quelqu'un d'autre */
    ambassadeurDe: (m: Membre) => membres.find((x) => x.id !== m.id && x.is_ambassador && memePromo(x, m)) ?? null,
    changerRole: (m: Membre, role: Role) => maj(m.id, { role, max_codes_allowed: quota(role, m.is_ambassador) }),
    changerAmbassadeur: (m: Membre, amb: boolean) => maj(m.id, { is_ambassador: amb, max_codes_allowed: quota(m.role, amb) }),
    supprimer: (m: Membre) => setMembres((l) => l.filter((x) => x.id !== m.id)),
  }
}
export type Etat = ReturnType<typeof useMembres>

// Tous = membres + modérateurs + administrateurs ; les ambassadeurs ont aussi l'un de ces rôles
export const FILTRES: Filtre[] = ['tous', 'alumni', 'moderator', 'admin', 'ambassadeurs']
export const texteFiltre = (f: Filtre) =>
  f === 'tous' ? 'Tous' : f === 'ambassadeurs' ? 'Ambassadeurs' : ROLES.find((r) => r.valeur === f)!.pluriel

/** Recherche, filtre par rôle et choix de l'école */
export function Outils({ e }: { e: Etat }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:gap-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Rechercher un membre</span>
          <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-olive" aria-hidden="true" />
          <input
            type="search"
            value={e.recherche}
            onChange={(x) => e.setRecherche(x.target.value)}
            placeholder="Nom ou email"
            className="h-14 w-full rounded-full bg-white pl-14 pr-6 text-base text-encre outline-none ring-vert/30 placeholder:text-olive focus-visible:ring-2"
          />
        </label>
        <label className="relative sm:w-56">
          <span className="sr-only">École</span>
          <select
            value={e.ecole}
            onChange={(x) => e.setEcole(x.target.value)}
            className="h-14 w-full appearance-none rounded-full bg-white pl-6 pr-12 text-base text-encre outline-none ring-vert/30 focus-visible:ring-2"
          >
            <option value="">Toutes les écoles</option>
            {e.ecoles.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-5 top-1/2 size-5 -translate-y-1/2 text-olive" aria-hidden="true" />
        </label>
      </div>
      <div className="min-w-0">
        <Filtres libelle="Type de membre" valeur={e.filtre} onChange={e.setFiltre} options={FILTRES.map((f) => ({ valeur: f, texte: texteFiltre(f), n: e.compte(f) }))} />
      </div>
    </div>
  )
}

/* ─────────── Le rôle ─────────── */

/** Membre, modérateur ou administrateur : trois choix côte à côte */
export function ChoixRole({ m, e, moi }: { m: Membre; e: Etat; moi: boolean }) {
  return (
    <fieldset>
      <legend className="text-sm text-olive">Rôle</legend>
      <div role="radiogroup" className="mt-2 flex w-full gap-1 rounded-full bg-sable/60 p-1 lg:inline-flex lg:w-auto">
        {ROLES.map((r) => {
          const actif = m.role === r.valeur
          const interdit = moi && r.valeur !== 'admin'
          return (
            <button
              key={r.valeur}
              type="button"
              role="radio"
              aria-checked={actif}
              disabled={interdit}
              onClick={() => e.changerRole(m, r.valeur)}
              className={`inline-flex min-h-10 flex-1 items-center justify-center rounded-full px-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 lg:flex-none lg:px-4 ${
                actif ? 'bg-white font-semibold text-vert' : 'text-encre hover:text-terre'
              }`}
            >
              <span className="sm:hidden">{r.court}</span>
              <span className="hidden sm:inline">{r.texte}</span>
            </button>
          )
        })}
      </div>
      {moi && <p className="mt-2 text-sm text-olive">Vous ne pouvez pas retirer vos propres droits.</p>}
    </fieldset>
  )
}

/* ─────────── Ambassadeur ─────────── */

/** Un seul ambassadeur par promo : si quelqu'un d'autre l'est, l'interrupteur n'apparaît pas */
export function ChoixAmbassadeurMembre({ m, e }: { m: Membre; e: Etat }) {
  const id = useId()
  const autre = e.ambassadeurDe(m)
  if (autre && !m.is_ambassador) {
    return (
      <p className="text-base text-olive">
        {nom(autre)} représente la promo {m.ecole} {m.entry_year}.
      </p>
    )
  }
  return (
    <div className="flex min-h-12 items-center justify-between gap-4 rounded-2xl bg-creme px-4 py-2">
      <label htmlFor={id} className="min-w-0 cursor-pointer">
        <span className="block text-base text-encre">Ambassadeur de sa promo</span>
        <span className="block text-sm text-olive">
          {m.role === 'admin' ? 'Invitations sans limite, comme tout administrateur.' : '15 invitations au lieu de 3.'}
        </span>
      </label>
      <span className="flex shrink-0 items-center gap-3">
        <span aria-hidden="true" className="w-8 text-right text-sm text-olive">
          {m.is_ambassador ? 'Oui' : 'Non'}
        </span>
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={m.is_ambassador}
          onClick={() => e.changerAmbassadeur(m, !m.is_ambassador)}
          className={`relative h-8 w-14 rounded-full transition-colors duration-200 ${m.is_ambassador ? 'bg-vert' : 'bg-sable'}`}
        >
          <span
            className={`absolute top-1 size-6 rounded-full transition-[left] duration-200 ${m.is_ambassador ? 'left-7 bg-creme' : 'left-1 bg-white'}`}
          />
        </button>
      </span>
    </div>
  )
}

/** Les invitations : utilisées sur le quota */
export const invitations = (m: Membre) =>
  `${m.codes_utilises} ${m.codes_utilises > 1 ? 'invitations' : 'invitation'}${m.max_codes_allowed >= 999 ? ', sans limite' : ` sur ${m.max_codes_allowed}`}`

/* ─────────── En-tête ─────────── */

export function EnteteMaquette() {
  return (
    <>
      <div className="bg-terre px-4 py-2 text-center text-sm text-creme">Maquette · membres fictifs, rien n’est enregistré</div>
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
              <ChevronDown className="size-4" aria-hidden="true" />
            </span>
          </nav>
          <span className="hidden items-center gap-2 lg:flex">
            <span className="grid size-11 place-items-center text-vert">
              <Search className="size-5" aria-hidden="true" />
            </span>
            <Portrait prenom="Koffi" nom="Mensah" className="size-9 rounded-full bg-vert text-xs text-creme" />
            <span className="text-base">Koffi</span>
          </span>
          <span className="text-base text-vert lg:hidden">Menu</span>
        </div>
      </header>
    </>
  )
}

/* ─────────── Supprimer ─────────── */

/** Supprimer le compte, après confirmation. Ni soi-même, ni un administrateur (lui retirer d'abord ses droits). */
/** En bas de la fiche : « Supprimer le compte » à gauche, « Profil » à droite ; la confirmation s'ouvre dessous.
 * Ni soi-même, ni un administrateur (lui retirer d'abord ses droits). */
export function Supprimer({ m, e, moi, onFait }: { m: Membre; e: Etat; moi: boolean; onFait?: () => void }) {
  const [confirme, setConfirme] = useState(false)
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
        {moi ? (
          <span />
        ) : m.role === 'admin' ? (
          <p className="max-w-[34ch] text-sm text-olive">Pour supprimer ce compte, retirez-lui d’abord ses droits d’administrateur.</p>
        ) : (
          <button
            type="button"
            aria-expanded={confirme}
            className="inline-flex min-h-11 items-center text-base text-alerte underline-offset-4 hover:underline"
            onClick={() => setConfirme(true)}
          >
            Supprimer le compte
          </button>
        )}
        <a href={`/profile/${m.id}`} className="ml-auto inline-flex min-h-11 items-center gap-1 text-base text-encre transition-colors hover:text-terre">
          Profil
          <ArrowUpRight className="size-[18px]" aria-hidden="true" />
        </a>
      </div>
      {confirme && !moi && m.role !== 'admin' && <Confirmation m={m} e={e} onFait={onFait} onAnnule={() => setConfirme(false)} />}
    </div>
  )
}

function Confirmation({ m, e, onFait, onAnnule }: { m: Membre; e: Etat; onFait?: () => void; onAnnule: () => void }) {
  return (
    <div className="rounded-2xl bg-creme p-4">
      <p className="text-base text-encre">
        Supprimer le compte de {nom(m)}{' '}? Sa fiche disparaît de l’annuaire et ses codes encore valables sont révoqués. On ne peut pas revenir en arrière.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
        <button
          type="button"
          className="inline-flex min-h-12 items-center rounded-full bg-alerte px-7 text-base font-semibold text-white hover:bg-alerte/90"
          onClick={() => {
            e.supprimer(m)
            onFait?.()
          }}
        >
          Supprimer le compte
        </button>
        <button type="button" className="inline-flex min-h-11 items-center text-base text-encre hover:text-terre" onClick={onAnnule}>
          Annuler
        </button>
      </div>
    </div>
  )
}

/** Rôle et statut, en quelques mots : « Administrateur · ambassadeur » */
export function Statut({ m, className = '' }: { m: Membre; className?: string }) {
  const morceaux = [m.role !== 'alumni' ? libelleRole(m.role) : null, m.is_ambassador ? 'ambassadeur' : null].filter(Boolean) as string[]
  if (!morceaux.length) return null
  const texte = morceaux.join(' · ')
  return <span className={`text-terre ${className}`}>{texte.charAt(0).toUpperCase() + texte.slice(1)}</span>
}
