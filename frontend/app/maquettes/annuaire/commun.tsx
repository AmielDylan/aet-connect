'use client'

// Maquettes de l'annuaire : membres fictifs (forme de l'API directory_entries), filtres et pièces partagées.
// Temporaire : supprimé une fois la proposition choisie et intégrée.
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Search } from 'lucide-react'
import { Brand } from '@/components/landing/site-header'
import { Portrait } from '@/components/espace/portrait'

export type Membre = {
  id: string
  first_name: string
  last_name: string
  school_name: string
  entry_year: string
  current_city: string | null
  current_country: string | null
  is_ambassador: boolean
}

const m = (id: number, p: string, n: string, e: string, a: string, v: string | null, c: string | null, amb = false): Membre => ({
  id: String(id),
  first_name: p,
  last_name: n,
  school_name: e,
  entry_year: a,
  current_city: v,
  current_country: c,
  is_ambassador: amb,
})

export const MOI = { first_name: 'Koffi', last_name: 'Mensah', ecole: 'EMPT Bingerville', promo: '2005', ville: 'Abidjan' }

export const MEMBRES: Membre[] = [
  m(1, 'Aïcha', 'Traoré', 'EMPT Bingerville', '2005', 'Abidjan', 'Côte d’Ivoire', true),
  m(2, 'Moussa', 'Keïta', 'EMPT Bingerville', '2005', 'Bamako', 'Mali'),
  m(3, 'Yao', 'Kouassi', 'EMPT Bingerville', '2005', 'Abidjan', 'Côte d’Ivoire'),
  m(4, 'Fatou', 'Diallo', 'EMPT Bingerville', '2005', 'Paris', 'France'),
  m(5, 'Ibrahima', 'Sow', 'PMS Saint-Louis', '1998', 'Dakar', 'Sénégal', true),
  m(6, 'Mariam', 'Coulibaly', 'EMPT Bingerville', '2011', 'Bouaké', 'Côte d’Ivoire'),
  m(7, 'Serge', 'Akakpo', 'CME Tchitchao', '2003', 'Lomé', 'Togo'),
  m(8, 'Adama', 'Ouattara', 'PMK Kamboincè', '2005', 'Ouagadougou', 'Burkina Faso', true),
  m(9, 'Rodrigue', 'Hounkpatin', 'PMB Bembéréké', '2009', 'Cotonou', 'Bénin'),
  m(10, 'Nadège', 'Mba', 'PML Libreville', '2001', 'Libreville', 'Gabon'),
  m(11, 'Issoufou', 'Moussa', 'PMN Niamey', '1996', 'Niamey', 'Niger'),
  m(12, 'Jean-Baptiste', 'Ouédraogo', 'PMK Kamboincè', '2007', 'Montréal', 'Canada'),
  m(13, 'Awa', 'Ndiaye', 'PMS Saint-Louis', '2010', 'Dakar', 'Sénégal'),
  m(14, 'Kodjo', 'Agbeko', 'CME Tchitchao', '2003', 'Lomé', 'Togo', true),
  m(15, 'Boubacar', 'Diarra', 'PMK (Kati) Kati', '2002', 'Bamako', 'Mali'),
  m(16, 'Christelle', 'Adjovi', 'LMJF-GMK Natitingou', '2012', 'Cotonou', 'Bénin'),
]
export const TOTAL_RESEAU = 1480

export type Filtres = { q: string; ecole: string; promo: string; pays: string; ville: string }
export const VIDE: Filtres = { q: '', ecole: '', promo: '', pays: '', ville: '' }

const sansAccents = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

/** Filtrage côté client pour la maquette (le vrai filtre est fait par l'API) */
export function useAnnuaire(initial: Partial<Filtres> = {}) {
  const [f, setF] = useState<Filtres>({ ...VIDE, ...initial })
  const resultats = useMemo(() => {
    const mots = sansAccents(f.q).split(/\s+/).filter(Boolean)
    return MEMBRES.filter((x) => {
      const fiche = sansAccents(`${x.first_name} ${x.last_name} ${x.school_name} ${x.entry_year} ${x.current_city ?? ''}`)
      return (
        mots.every((mot) => fiche.includes(mot)) &&
        (!f.ecole || x.school_name === f.ecole) &&
        (!f.promo || x.entry_year === f.promo) &&
        (!f.pays || x.current_country === f.pays) &&
        (!f.ville || x.current_city === f.ville)
      )
    })
  }, [f])
  const set = (k: keyof Filtres, v: string) => setF((p) => ({ ...p, [k]: v, ...(k === 'ecole' ? { promo: '' } : {}) }))
  const actifs = (['ecole', 'promo', 'pays', 'ville'] as const).filter((k) => f[k]).length + (f.q ? 1 : 0)
  return { f, set, setF, resultats, actifs, effacer: () => setF(VIDE) }
}

const uniques = (l: (string | null)[]) => [...new Set(l.filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b, 'fr'))
export const OPTIONS = {
  ecole: uniques(MEMBRES.map((x) => x.school_name)),
  promo: uniques(MEMBRES.map((x) => x.entry_year)).reverse(),
  pays: uniques(MEMBRES.map((x) => x.current_country)),
  ville: uniques(MEMBRES.map((x) => x.current_city)),
}

/** Liste déroulante native, au style des champs du site */
export function Choix({
  label,
  valeur,
  onChange,
  options,
  tous,
  cache = false,
  className = '',
}: {
  label: string
  valeur: string
  onChange: (v: string) => void
  options: string[]
  tous: string
  cache?: boolean
  className?: string
}) {
  return (
    <label className={`grid gap-1.5 ${className}`}>
      <span className={cache ? 'sr-only' : 'text-sm font-semibold text-vert'}>{label}</span>
      <span className="relative">
        <select
          value={valeur}
          onChange={(e) => onChange(e.target.value)}
          className={`min-h-11 w-full cursor-pointer appearance-none rounded-full border-2 bg-white pl-4 pr-10 text-base text-encre hover:border-olive focus-visible:border-vert ${
            valeur ? 'border-vert' : 'border-trait'
          }`}
        >
          <option value="">{tous}</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {label === 'Promo' ? `Promo ${o}` : o}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-[18px] -translate-y-1/2 text-vert" aria-hidden="true" />
      </span>
    </label>
  )
}

export function ChampRecherche({ valeur, onChange, grand = false }: { valeur: string; onChange: (v: string) => void; grand?: boolean }) {
  return (
    <label className="relative block">
      <span className="sr-only">Rechercher un AET</span>
      <Search className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-olive ${grand ? 'left-5 size-6' : 'left-4 size-5'}`} aria-hidden="true" />
      <input
        type="search"
        value={valeur}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Nom, école, promo, ville"
        className={`w-full appearance-none rounded-full border-2 border-trait bg-white text-encre placeholder:text-olive focus-visible:border-vert [&::-webkit-search-cancel-button]:appearance-none ${
          grand ? 'min-h-14 pl-14 pr-5 text-lg' : 'min-h-11 pl-12 pr-4 text-base'
        }`}
      />
    </label>
  )
}

export const ou = (x: Membre) => [x.current_city, x.current_country].filter(Boolean).join(', ')

export function Representant() {
  return <span className="rounded-full bg-terre/10 px-2.5 py-0.5 text-xs font-semibold text-terre">Représente sa promo</span>
}

export function Aucun({ effacer }: { effacer: () => void }) {
  return (
    <div className="mt-8 rounded-3xl bg-white p-8 text-center">
      <p className="text-lg text-encre">Personne ne correspond à cette recherche pour le moment.</p>
      <p className="mt-1 text-base text-olive">Les filtres sont peut-être trop précis.</p>
      <button type="button" onClick={effacer} className="mt-4 inline-flex min-h-11 items-center text-base text-encre hover:text-terre hover:underline">
        Effacer les filtres
      </button>
    </div>
  )
}

export function EnteteMaquette() {
  return (
    <>
      <div className="bg-terre px-4 py-2 text-center text-sm text-creme">Maquette · membres fictifs</div>
      <header className="sur-creme">
        <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
          <span className="text-vert">
            <Brand />
          </span>
          <nav className="hidden items-center gap-7 lg:flex">
            {['Accueil', 'Annuaire', 'Mes codes', 'Écoles'].map((l) => (
              <Link
                key={l}
                href="#"
                className={`inline-flex min-h-11 items-center text-base ${l === 'Annuaire' ? 'text-vert underline decoration-terre decoration-2 underline-offset-8' : 'text-encre'}`}
              >
                {l}
              </Link>
            ))}
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
