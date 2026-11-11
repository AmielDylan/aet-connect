'use client'

// Maquettes du profil public d'un membre : un profil complet et un profil discret (coordonnées masquées),
// à la forme de la réponse de l'API (les champs masqués par le membre arrivent à null).
import { useState } from 'react'
import Link from 'next/link'
import { Check, Copy, Linkedin, Mail, Phone, Search } from 'lucide-react'
import { Brand } from '@/components/landing/site-header'
import { Portrait } from '@/components/espace/portrait'

export type Profil = {
  id: string
  first_name: string
  last_name: string
  is_ambassador: boolean
  school: { name_fr: string; acronym: string; country: string } | null
  ville_ecole: string
  entry_year: string | null
  current_city: string | null
  current_country: string | null
  bio: string | null
  email: string | null
  phone: string | null
  linkedin_url: string | null
}

const BASE = {
  id: '1',
  first_name: 'Aïcha',
  last_name: 'Traoré',
  is_ambassador: true,
  school: { name_fr: 'École Militaire Préparatoire Technique', acronym: 'EMPT', country: 'Côte d’Ivoire' },
  ville_ecole: 'Bingerville',
  entry_year: '2005',
}

export const COMPLET: Profil = {
  ...BASE,
  current_city: 'Abidjan',
  current_country: 'Côte d’Ivoire',
  bio: 'Ingénieure en télécommunications, j’ai passé dix ans entre Abidjan et Dakar avant de revenir au pays. Toujours partante pour aider un collègue de la promo ou un plus jeune qui cherche sa voie.',
  email: 'aicha.traore@exemple.com',
  phone: '+225 07 00 00 00 00',
  linkedin_url: 'https://www.linkedin.com/in/exemple',
}
export const DISCRET: Profil = { ...BASE, current_city: null, current_country: null, bio: null, email: null, phone: null, linkedin_url: null }

/** Le membre connecté : de la même promo que le profil consulté */
export const MOI = { first_name: 'Koffi', last_name: 'Mensah', promo: '2005', ecole: 'EMPT' }

export const COLLEGUES = [
  ['Koffi', 'Mensah'],
  ['Moussa', 'Keïta'],
  ['Yao', 'Kouassi'],
  ['Fatou', 'Diallo'],
  ['Jean-Baptiste', 'Ouédraogo'],
  ['Mariam', 'Coulibaly'],
].map(([p, n], i) => ({ id: String(i + 10), first_name: p, last_name: n }))
export const TOTAL_PROMO = 14

export const ecole = (p: Profil) => (p.school ? `${p.school.acronym} ${p.ville_ecole}` : '')
/** Le lien avec la personne qui consulte */
export const lien = (p: Profil) => (p.entry_year === MOI.promo ? 'Votre collègue de promotion' : 'De votre école')

/** Les coordonnées que le membre a choisi de montrer ; rien d'autre */
export function Coordonnees({ p, tone = 'creme' }: { p: Profil; tone?: 'creme' | 'blanc' }) {
  const [copie, setCopie] = useState(false)
  if (!p.email && !p.phone && !p.linkedin_url) {
    return <p className="text-base leading-relaxed text-olive">{p.first_name} n’a pas rendu ses coordonnées visibles.</p>
  }
  const ligne = `flex min-h-12 items-center gap-3 rounded-2xl px-4 text-base text-encre transition-colors hover:text-terre ${tone === 'blanc' ? 'bg-white' : 'bg-creme'}`
  return (
    <ul className="grid gap-2">
      {p.email && (
        <li className="flex items-center gap-2">
          <a href={`mailto:${p.email}`} className={`${ligne} min-w-0 flex-1`}>
            <Mail className="size-[18px] shrink-0 text-vert" aria-hidden="true" />
            <span className="truncate">{p.email}</span>
          </a>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(p.email!).then(() => {
                setCopie(true)
                setTimeout(() => setCopie(false), 2000)
              })
            }}
            className="grid size-12 shrink-0 place-items-center rounded-full text-vert transition-colors hover:bg-sable/60 hover:text-terre"
            aria-label={copie ? 'Adresse copiée' : 'Copier l’adresse email'}
          >
            {copie ? <Check className="size-[18px]" aria-hidden="true" /> : <Copy className="size-[18px]" aria-hidden="true" />}
          </button>
        </li>
      )}
      {p.phone && (
        <li>
          <a href={`tel:${p.phone.replace(/\s/g, '')}`} className={ligne}>
            <Phone className="size-[18px] shrink-0 text-vert" aria-hidden="true" />
            {p.phone}
          </a>
        </li>
      )}
      {p.linkedin_url && (
        <li>
          <a href={p.linkedin_url} target="_blank" rel="noopener noreferrer" className={ligne}>
            <Linkedin className="size-[18px] shrink-0 text-vert" aria-hidden="true" />
            Son profil LinkedIn
          </a>
        </li>
      )}
    </ul>
  )
}

export function Representant() {
  return <span className="rounded-full bg-terre/10 px-2.5 py-0.5 text-xs font-semibold text-terre">Représente sa promo</span>
}

/** Bandeau de maquette (profil complet / discret) et en-tête statique de l'espace */
export function EnteteMaquette({ discret, setDiscret }: { discret: boolean; setDiscret: (v: boolean) => void }) {
  return (
    <>
      <div className="bg-terre px-4 py-2 text-center text-sm text-creme">
        Maquette ·{' '}
        <button type="button" onClick={() => setDiscret(!discret)} className="underline underline-offset-4">
          {discret ? 'Voir un profil complet' : 'Voir un profil discret (coordonnées masquées)'}
        </button>
      </div>
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
