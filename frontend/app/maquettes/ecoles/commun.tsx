'use client'

// Maquettes de la gestion des écoles (administration) : les neuf écoles de la base, à la forme de
// GET /api/admin/schools (avec user_count), et un état local qui imite l'ajout, la modification et la suppression.
import { useId, useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Search } from 'lucide-react'
import { Brand } from '@/components/landing/site-header'
import { Portrait } from '@/components/espace/portrait'
import { Champ, ZoneTexte, champClasse } from '@/components/registration/kit'

export { Drapeau } from '@/components/landing/drapeau'
export { N, boutonAlerte, boutonVert, lienAlerte, lienSimple } from '@/components/espace/administration'

export const titre2 = 'font-titre text-xl font-semibold tracking-[-0.02em] text-vert'

export type Ecole = {
  id: string
  acronym: string | null
  name_fr: string
  city: string
  country: string
  established_year: number | null
  description: string | null
  user_count: number
}

const DEPART: Ecole[] = [
  { id: 'e1', acronym: 'EMPT', name_fr: 'École Militaire Préparatoire Technique', city: 'Bingerville', country: 'Côte d’Ivoire', established_year: 1962, description: 'Internat militaire dès la classe de 6e, ouvert aux garçons et aux filles.', user_count: 27 },
  { id: 'e2', acronym: 'PMS', name_fr: 'Prytanée militaire Charles N’Tchoréré de Saint-Louis', city: 'Saint-Louis', country: 'Sénégal', established_year: 1973, description: 'Lycée militaire réputé pour sa sélectivité : cinquante élèves choisis chaque année.', user_count: 19 },
  { id: 'e3', acronym: 'CME', name_fr: 'Collège Militaire Eyadema', city: 'Tchitchao', country: 'Togo', established_year: 1979, description: 'Établissement secondaire en internat, d’abord réservé aux enfants de militaires.', user_count: 14 },
  { id: 'e4', acronym: 'PMK (Kati)', name_fr: 'Prytanée militaire de Kati', city: 'Kati', country: 'Mali', established_year: 1981, description: 'Lycée militaire très sélectif, jusqu’au baccalauréat.', user_count: 11 },
  { id: 'e5', acronym: 'PMB', name_fr: 'Prytanée militaire de Bembéréké', city: 'Bembéréké', country: 'Bénin', established_year: 1986, description: 'Collège-lycée militaire, tourné vers les carrières civiles et militaires.', user_count: 34 },
  { id: 'e6', acronym: 'PMK', name_fr: 'Prytanée militaire de Kadiogo', city: 'Kamboincè', country: 'Burkina Faso', established_year: 1992, description: 'Internat militaire d’enseignement secondaire, sous tutelle de la Défense et de l’Éducation.', user_count: 7 },
  { id: 'e7', acronym: 'PMN', name_fr: 'Prytanée militaire de Niamey', city: 'Niamey', country: 'Niger', established_year: 1996, description: 'Enseignement secondaire et formation militaire.', user_count: 4 },
  { id: 'e8', acronym: 'LMJF-GMK', name_fr: 'Lycée Militaire des Jeunes Filles Général Mathieu Kérékou', city: 'Natitingou', country: 'Bénin', established_year: 2000, description: 'Le seul lycée militaire exclusivement féminin du Bénin.', user_count: 9 },
  { id: 'e9', acronym: 'PML', name_fr: 'Prytanée Militaire de Libreville', city: 'Libreville', country: 'Gabon', established_year: 2001, description: 'Établissement public d’enseignement secondaire, collège et lycée.', user_count: 3 },
  { id: 'e10', acronym: null, name_fr: 'École militaire de Bouaké', city: 'Bouaké', country: 'Côte d’Ivoire', established_year: null, description: null, user_count: 0 },
]

/** Les pays dont le site sait dessiner le drapeau */
export const PAYS = ['Bénin', 'Burkina Faso', 'Côte d’Ivoire', 'Gabon', 'Mali', 'Niger', 'Sénégal', 'Togo']

export type Brouillon = Omit<Ecole, 'id' | 'user_count'>
export const VIDE: Brouillon = { acronym: '', name_fr: '', city: '', country: '', established_year: null, description: '' }
export const brouillonDe = (e: Ecole): Brouillon => ({
  acronym: e.acronym ?? '',
  name_fr: e.name_fr,
  city: e.city,
  country: e.country,
  established_year: e.established_year,
  description: e.description ?? '',
})

/** Les écoles et ce qu'on en fait, en mémoire */
export function useEcoles() {
  const [ecoles, setEcoles] = useState(DEPART)
  const [recherche, setRecherche] = useState('')
  const t = recherche.trim().toLowerCase()
  return {
    ecoles,
    visibles: ecoles.filter((e) => !t || `${e.acronym ?? ''} ${e.name_fr} ${e.city} ${e.country}`.toLowerCase().includes(t)),
    recherche,
    setRecherche,
    enregistrer: (id: string, b: Brouillon) =>
      setEcoles((l) => l.map((e) => (e.id === id ? { ...e, ...b, acronym: b.acronym?.trim() || null, description: b.description?.trim() || null } : e))),
    ajouter: (b: Brouillon) => {
      const id = `n${Date.now()}`
      setEcoles((l) => [...l, { ...b, id, acronym: b.acronym?.trim() || null, description: b.description?.trim() || null, user_count: 0 }])
      return id
    },
    supprimer: (id: string) => setEcoles((l) => l.filter((e) => e.id !== id)),
  }
}
export type Etat = ReturnType<typeof useEcoles>

export const nomCourt = (e: Pick<Ecole, 'acronym' | 'name_fr'>) => e.acronym || e.name_fr
export const membres = (n: number) => `${n.toLocaleString('fr-FR')} ${n > 1 ? 'membres' : 'membre'}`

/* ─────────── Le formulaire ─────────── */

function verifier(b: Brouillon) {
  const e: Partial<Record<keyof Brouillon, string>> = {}
  if (b.name_fr.trim().length < 3) e.name_fr = 'Il manque le nom complet de l’école.'
  if (!b.city.trim()) e.city = 'Il manque la ville.'
  if (!b.country.trim()) e.country = 'Il manque le pays.'
  if ((b.acronym ?? '').trim().length > 10) e.acronym = 'Le sigle tient en 10 caractères au plus.'
  const annee = b.established_year
  if (annee !== null && (annee < 1800 || annee > new Date().getFullYear())) e.established_year = `Une année entre 1800 et ${new Date().getFullYear()}.`
  return e
}

/** Les champs d'une école. « Enregistrer » ne s'active qu'après une modification. */
export function FormulaireEcole({
  depart,
  libelle = 'Enregistrer',
  onEnregistrer,
  onAnnuler,
}: {
  depart: Brouillon
  libelle?: string
  onEnregistrer: (b: Brouillon) => void
  onAnnuler?: () => void
}) {
  const [b, setB] = useState(depart)
  const [erreurs, setErreurs] = useState<ReturnType<typeof verifier>>({})
  const [fait, setFait] = useState(false)
  const modifie = JSON.stringify(b) !== JSON.stringify(depart)
  const champ = <K extends keyof Brouillon>(k: K) => (v: Brouillon[K]) => {
    setB((x) => ({ ...x, [k]: v }))
    setFait(false)
  }
  // Le formulaire peut être rendu deux fois (mobile et grand écran) : un identifiant par rendu
  const base = useId()
  const id = (k: string) => `${base}-${k}`

  return (
    <form
      noValidate
      className="grid gap-5"
      onSubmit={(e) => {
        e.preventDefault()
        const v = verifier(b)
        setErreurs(v)
        if (Object.keys(v).length) return
        onEnregistrer(b)
        setFait(true)
      }}
    >
      <div className="grid gap-5 sm:grid-cols-[10rem_minmax(0,1fr)]">
        <Champ
          id={id('sigle')}
          label="Sigle"
          maxLength={10}
          value={b.acronym ?? ''}
          onChange={(e) => champ('acronym')(e.target.value)}
          erreur={erreurs.acronym}
        />
        <Champ id={id('nom')} label="Nom complet" value={b.name_fr} onChange={(e) => champ('name_fr')(e.target.value)} erreur={erreurs.name_fr} />
      </div>
      {!(b.acronym ?? '').trim() && (
        <p className="-mt-2 text-sm text-terre">Sans sigle, l’école n’apparaît pas sur la page « Les écoles » ni sur l’accueil.</p>
      )}
      <div className="grid gap-5 sm:grid-cols-3">
        <div className="grid gap-2">
          <label htmlFor={id('pays')} className="text-sm font-semibold text-vert">
            Pays
          </label>
          <input
            id={id('pays')}
            list={id('pays-liste')}
            value={b.country}
            onChange={(e) => champ('country')(e.target.value)}
            aria-invalid={erreurs.country ? true : undefined}
            className={champClasse}
          />
          <datalist id={id('pays-liste')}>
            {PAYS.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
          {erreurs.country && <p className="text-sm text-alerte">{erreurs.country}</p>}
        </div>
        <Champ id={id('ville')} label="Ville" value={b.city} onChange={(e) => champ('city')(e.target.value)} erreur={erreurs.city} />
        <Champ
          id={id('annee')}
          label="Fondée en"
          inputMode="numeric"
          value={b.established_year ?? ''}
          onChange={(e) => champ('established_year')(e.target.value ? Number(e.target.value.replace(/\D/g, '')) : null)}
          erreur={erreurs.established_year}
        />
      </div>
      <ZoneTexte
        id={id('description')}
        label="Description"
        rows={3}
        maxLength={300}
        value={b.description ?? ''}
        onChange={(e) => champ('description')(e.target.value)}
        aide={<span className="tabular-nums">{(b.description ?? '').length}/300 · trois lignes sur la page « Les écoles »</span>}
      />
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <button type="submit" disabled={!modifie} className="inline-flex min-h-12 items-center justify-center rounded-full bg-vert px-7 text-base font-semibold text-creme transition-colors hover:bg-vert-carte disabled:opacity-40">
          {libelle}
        </button>
        {modifie && onAnnuler === undefined && (
          <button type="button" className="inline-flex min-h-11 items-center text-base text-encre hover:text-terre" onClick={() => setB(depart)}>
            Annuler les changements
          </button>
        )}
        {onAnnuler && (
          <button type="button" className="inline-flex min-h-11 items-center text-base text-encre hover:text-terre" onClick={onAnnuler}>
            Annuler
          </button>
        )}
        {fait && !modifie && <span className="text-base text-vert">Enregistré</span>}
      </div>
    </form>
  )
}

/* ─────────── Supprimer ─────────── */

/** Une école qui a des membres ne se supprime pas ; sinon, après confirmation */
export function SupprimerEcole({ e, onSupprimer }: { e: Ecole; onSupprimer: () => void }) {
  const [confirme, setConfirme] = useState(false)
  if (e.user_count > 0) {
    return <p className="text-sm text-olive">{membres(e.user_count)} y sont rattachés : l’école ne peut pas être supprimée.</p>
  }
  if (!confirme) {
    return (
      <button type="button" className="inline-flex min-h-11 items-center text-base text-alerte underline-offset-4 hover:underline" onClick={() => setConfirme(true)}>
        Supprimer l’école
      </button>
    )
  }
  return (
    <div className="rounded-2xl bg-creme p-4">
      <p className="text-base text-encre">Supprimer {nomCourt(e)}{' '}? Aucun membre n’y est rattaché. On ne peut pas revenir en arrière.</p>
      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
        <button type="button" className="inline-flex min-h-12 items-center rounded-full bg-alerte px-7 text-base font-semibold text-white hover:bg-alerte/90" onClick={onSupprimer}>
          Supprimer l’école
        </button>
        <button type="button" className="inline-flex min-h-11 items-center text-base text-encre hover:text-terre" onClick={() => setConfirme(false)}>
          Annuler
        </button>
      </div>
    </div>
  )
}

/* ─────────── Recherche ─────────── */

export function Recherche({ e }: { e: Etat }) {
  return (
    <label className="relative block">
      <span className="sr-only">Rechercher une école</span>
      <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-olive" aria-hidden="true" />
      <input
        type="search"
        value={e.recherche}
        onChange={(x) => e.setRecherche(x.target.value)}
        placeholder="Sigle, nom, ville ou pays"
        className="h-14 w-full rounded-full bg-white pl-14 pr-6 text-base text-encre outline-none ring-vert/30 placeholder:text-olive focus-visible:ring-2"
      />
    </label>
  )
}

/* ─────────── En-tête ─────────── */

export function EnteteMaquette() {
  return (
    <>
      <div className="bg-terre px-4 py-2 text-center text-sm text-creme">Maquette · rien n’est enregistré</div>
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
            <Portrait prenom="Koffi" nom="Mensah" className="size-9 rounded-full bg-vert text-xs text-creme" />
            <span className="text-base">Koffi</span>
          </span>
          <span className="text-base text-vert lg:hidden">Menu</span>
        </div>
      </header>
    </>
  )
}
