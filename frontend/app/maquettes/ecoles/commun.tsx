'use client'

// Maquettes de « Les écoles » : les neuf écoles réelles de la base (sigle, ville, pays, année, description),
// avec des nombres d'AET fictifs. Le membre fictif est du Prytanée militaire de Bembéréké.
import Link from 'next/link'
import { Search } from 'lucide-react'
import { Brand } from '@/components/landing/site-header'
import { Portrait } from '@/components/espace/portrait'

export const N = ' '
export const titre2 = 'font-titre text-xl font-semibold tracking-[-0.02em] text-vert'

export type Ecole = {
  id: string
  acronym: string
  name_fr: string
  city: string
  country: string
  established_year: number
  description: string
  total_members: number
  total_ambassadors: number
}

export const ECOLES: Ecole[] = [
  {
    id: 'empt',
    acronym: 'EMPT',
    name_fr: 'École Militaire Préparatoire Technique',
    city: 'Bingerville',
    country: 'Côte d’Ivoire',
    established_year: 1962,
    description:
      'Internat militaire dès la classe de 6e, ouvert aux garçons et filles depuis 2013. L’EMPT combine enseignement général et technique avec une formation physique, morale et militaire.',
    total_members: 186,
    total_ambassadors: 12,
  },
  {
    id: 'pms',
    acronym: 'PMS',
    name_fr: 'Prytanée militaire Charles N’Tchoréré',
    city: 'Saint-Louis',
    country: 'Sénégal',
    established_year: 1973,
    description:
      'Lycée militaire de la 6e à la terminale : une cinquantaine d’élèves sénégalais admis chaque année, et une quinzaine venus des pays partenaires.',
    total_members: 142,
    total_ambassadors: 9,
  },
  {
    id: 'cme',
    acronym: 'CME',
    name_fr: 'Collège Militaire Eyadema',
    city: 'Tchitchao',
    country: 'Togo',
    established_year: 1979,
    description: 'Établissement secondaire en internat, de la 6e à la terminale, qui associe enseignement général et formation morale et militaire.',
    total_members: 97,
    total_ambassadors: 6,
  },
  {
    id: 'pmk-kati',
    acronym: 'PMK',
    name_fr: 'Prytanée militaire de Kati',
    city: 'Kati',
    country: 'Mali',
    established_year: 1981,
    description: 'Lycée militaire en internat qui mène jusqu’au baccalauréat avec un grade militaire. Ouvert aux filles depuis 1998.',
    total_members: 118,
    total_ambassadors: 7,
  },
  {
    id: 'pmb',
    acronym: 'PMB',
    name_fr: 'Prytanée militaire de Bembéréké',
    city: 'Bembéréké',
    country: 'Bénin',
    established_year: 1986,
    description: 'Collège-lycée militaire qui prépare aux carrières civiles et militaires. Admission sur concours, d’après les résultats du CEP.',
    total_members: 214,
    total_ambassadors: 15,
  },
  {
    id: 'pmk',
    acronym: 'PMK',
    name_fr: 'Prytanée militaire de Kadiogo',
    city: 'Kamboincè',
    country: 'Burkina Faso',
    established_year: 1992,
    description: 'Internat militaire d’enseignement secondaire, sous la tutelle de la Défense et de l’Éducation. Ouvert aux filles depuis 2007.',
    total_members: 88,
    total_ambassadors: 5,
  },
  {
    id: 'pmn',
    acronym: 'PMN',
    name_fr: 'Prytanée militaire de Niamey',
    city: 'Niamey',
    country: 'Niger',
    established_year: 1996,
    description: 'Collège et lycée rattachés à la Défense, qui allient cursus général et formation militaire. Ouvert aux filles depuis 2010.',
    total_members: 64,
    total_ambassadors: 4,
  },
  {
    id: 'lmjf',
    acronym: 'LMJF',
    name_fr: 'Lycée Militaire des Jeunes Filles Général Mathieu Kérékou',
    city: 'Natitingou',
    country: 'Bénin',
    established_year: 2000,
    description: 'Le seul lycée militaire exclusivement féminin du Bénin : collège et lycée, avec un encadrement militaire.',
    total_members: 71,
    total_ambassadors: 5,
  },
  {
    id: 'pml',
    acronym: 'PML',
    name_fr: 'Prytanée Militaire de Libreville',
    city: 'Libreville',
    country: 'Gabon',
    established_year: 2001,
    description: 'Collège et lycée ouverts aux filles et aux garçons, recrutés sur concours en 6e, avec une instruction militaire jusqu’au baccalauréat.',
    total_members: 52,
    total_ambassadors: 3,
  },
]

export const MOI = { first_name: 'Koffi', last_name: 'Mensah', school_id: 'pmb', promo: '2005' }
export const MON_ECOLE = ECOLES.find((e) => e.id === MOI.school_id)!
export const AUTRES = ECOLES.filter((e) => e.id !== MOI.school_id)
export const FAITS = {
  ecoles: ECOLES.length,
  pays: new Set(ECOLES.map((e) => e.country)).size,
  depuis: Math.min(...ECOLES.map((e) => e.established_year)),
  aet: ECOLES.reduce((n, e) => n + e.total_members, 0),
}
export const lienAnnuaire = (e: Ecole) => `/dashboard/directory?school=${e.id}`
export const fmt = (n: number) => n.toLocaleString('fr-FR')

export function EnteteMaquette() {
  return (
    <>
      <div className="bg-terre px-4 py-2 text-center text-sm text-creme">Maquette · nombres d’AET fictifs</div>
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
                className={`inline-flex min-h-11 items-center text-base ${l === 'Écoles' ? 'text-vert underline decoration-terre decoration-2 underline-offset-8' : 'text-encre'}`}
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

export const boutonCreme =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-creme px-7 text-base font-semibold text-vert transition-colors duration-200 hover:bg-white'
