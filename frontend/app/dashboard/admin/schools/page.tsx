'use client'

// Administration · les écoles, proposition A « Le tri » : comme les demandes et les membres, la liste des écoles à
// gauche et l'école choisie à droite, ses champs modifiables sur place. « Ajouter une école » ouvre un formulaire
// vide au même endroit. Sur mobile, chaque école se déplie dans la liste.
import { useId, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronDown, Plus, Search } from 'lucide-react'
import { useAdminCheck } from '@/hooks/use-admin-check'
import { apiClient } from '@/lib/api'
import { Drapeau } from '@/components/landing/drapeau'
import { Champ, ZoneTexte, champClasse } from '@/components/registration/kit'
import { N, boutonAlerte, boutonVert, lienSimple } from '@/components/espace/administration'
import type { AdminSchool, AdminSchoolInput } from '@/types'

const NOUVELLE = 'nouvelle'
/** Les pays dont le site sait dessiner le drapeau */
const PAYS = ['Bénin', 'Burkina Faso', 'Côte d’Ivoire', 'Gabon', 'Mali', 'Niger', 'Sénégal', 'Togo']
const VIDE: AdminSchoolInput = { acronym: '', name_fr: '', city: '', country: '', established_year: null, description: '' }

const nomCourt = (e: Pick<AdminSchool, 'acronym' | 'name_fr'>) => e.acronym || e.name_fr
const membres = (n: number) => `${n.toLocaleString('fr-FR')} ${n > 1 ? 'membres' : 'membre'}`
const message = (e: unknown) => (e instanceof Error && e.message ? e.message : 'Une erreur est survenue. Réessayez.')
const grandEcran = () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches
const brouillonDe = (e: AdminSchool): AdminSchoolInput => ({
  acronym: e.acronym ?? '',
  name_fr: e.name_fr,
  city: e.city,
  country: e.country,
  established_year: e.established_year,
  description: e.description ?? '',
})

/** Les écoles du site (avec un sigle) d'abord, de la plus ancienne à la plus récente ; puis les autres */
function trier(ecoles: AdminSchool[]) {
  return [...ecoles].sort((a, b) =>
    a.acronym && b.acronym
      ? (a.established_year ?? 9999) - (b.established_year ?? 9999)
      : a.acronym
        ? -1
        : b.acronym
          ? 1
          : a.name_fr.localeCompare(b.name_fr, 'fr'),
  )
}

/* ─────────── Le formulaire ─────────── */

function verifier(b: AdminSchoolInput) {
  const e: Partial<Record<keyof AdminSchoolInput, string>> = {}
  if (b.name_fr.trim().length < 3) e.name_fr = 'Il manque le nom complet de l’école.'
  if (!b.city.trim()) e.city = 'Il manque la ville.'
  if (!b.country.trim()) e.country = 'Il manque le pays.'
  if ((b.acronym ?? '').trim().length > 10) e.acronym = 'Le sigle tient en 10 caractères au plus.'
  const annee = b.established_year
  if (annee !== null && (annee < 1800 || annee > new Date().getFullYear())) e.established_year = `Une année entre 1800 et ${new Date().getFullYear()}.`
  return e
}

/** Les champs d'une école. « Enregistrer » ne s'active qu'après une modification. */
function FormulaireEcole({
  depart,
  libelle = 'Enregistrer',
  onEnregistrer,
  onAnnuler,
}: {
  depart: AdminSchoolInput
  libelle?: string
  onEnregistrer: (b: AdminSchoolInput) => Promise<unknown>
  onAnnuler?: () => void
}) {
  const [b, setB] = useState(depart)
  const [erreurs, setErreurs] = useState<ReturnType<typeof verifier>>({})
  const [etat, setEtat] = useState<'repos' | 'envoi' | 'fait'>('repos')
  const [erreurServeur, setErreurServeur] = useState<string | null>(null)
  // Le formulaire peut être rendu deux fois (mobile et grand écran) : un identifiant par rendu
  const base = useId()
  const id = (k: string) => `${base}-${k}`
  const modifie = JSON.stringify(b) !== JSON.stringify(depart)
  const champ =
    <K extends keyof AdminSchoolInput>(k: K) =>
    (v: AdminSchoolInput[K]) => {
      setB((x) => ({ ...x, [k]: v }))
      setEtat('repos')
    }

  return (
    <form
      noValidate
      className="grid gap-5"
      onSubmit={async (e) => {
        e.preventDefault()
        const v = verifier(b)
        setErreurs(v)
        setErreurServeur(null)
        if (Object.keys(v).length) return
        setEtat('envoi')
        try {
          await onEnregistrer(b)
          setEtat('fait')
        } catch (err) {
          setErreurServeur(message(err))
          setEtat('repos')
        }
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
      {!(b.acronym ?? '').trim() && <p className="-mt-2 text-sm text-terre">Sans sigle, l’école n’apparaît pas sur la page « Les écoles » ni sur l’accueil.</p>}
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
            aria-describedby={erreurs.country ? id('pays-erreur') : undefined}
            className={champClasse}
          />
          <datalist id={id('pays-liste')}>
            {PAYS.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
          {erreurs.country && (
            <p id={id('pays-erreur')} className="text-sm text-alerte">
              {erreurs.country}
            </p>
          )}
        </div>
        <Champ id={id('ville')} label="Ville" value={b.city} onChange={(e) => champ('city')(e.target.value)} erreur={erreurs.city} />
        <Champ
          id={id('annee')}
          label="Fondée en"
          inputMode="numeric"
          maxLength={4}
          value={b.established_year ?? ''}
          onChange={(e) => {
            const chiffres = e.target.value.replace(/\D/g, '')
            champ('established_year')(chiffres ? Number(chiffres) : null)
          }}
          erreur={erreurs.established_year}
        />
      </div>
      <ZoneTexte
        id={id('description')}
        label="Description"
        rows={3}
        maxLength={1000}
        value={b.description ?? ''}
        onChange={(e) => champ('description')(e.target.value)}
        aide={<span className="tabular-nums">{(b.description ?? '').length}/1000 · les trois premières lignes se lisent sur la page « Les écoles »</span>}
      />
      {erreurServeur && (
        <p role="alert" className="text-base font-semibold text-alerte">
          {erreurServeur}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <button type="submit" disabled={!modifie || etat === 'envoi'} className={`${boutonVert} disabled:opacity-40`}>
          {etat === 'envoi' ? 'Enregistrement…' : libelle}
        </button>
        {modifie && !onAnnuler && etat !== 'envoi' && (
          <button
            type="button"
            className={lienSimple}
            onClick={() => {
              setB(depart)
              setErreurs({})
            }}
          >
            Annuler les changements
          </button>
        )}
        {onAnnuler && (
          <button type="button" className={lienSimple} onClick={onAnnuler}>
            Annuler
          </button>
        )}
        {etat === 'fait' && !modifie && (
          <span role="status" className="text-base text-vert">
            Enregistré
          </span>
        )}
      </div>
    </form>
  )
}

/* ─────────── Le détail : le formulaire, puis la suppression ─────────── */

function Detail({ ecole, onSupprimee }: { ecole: AdminSchool; onSupprimee: () => void }) {
  const queryClient = useQueryClient()
  const [confirme, setConfirme] = useState(false)
  const rafraichir = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-schools'] })
    queryClient.invalidateQueries({ queryKey: ['schools'] })
    queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
  }
  const supprimer = useMutation({
    mutationFn: () => apiClient.deleteSchool(ecole.id),
    onSuccess: () => {
      onSupprimee()
      rafraichir()
    },
  })

  return (
    <div className="grid gap-6">
      {/* Après l'enregistrement, « depart » devient la version enregistrée : le formulaire n'est plus « modifié » */}
      <FormulaireEcole
        key={ecole.id}
        depart={brouillonDe(ecole)}
        onEnregistrer={async (b) => {
          const maj = await apiClient.updateSchool(ecole.id, b)
          queryClient.setQueryData<AdminSchool[]>(['admin-schools'], (l) => l?.map((x) => (x.id === ecole.id ? { ...x, ...maj } : x)))
          rafraichir()
        }}
      />
      {ecole.user_count > 0 ? (
        <p className="text-sm text-olive">
          {membres(ecole.user_count)} {ecole.user_count > 1 ? 'y sont rattachés' : 'y est rattaché'} : l’école ne peut pas être supprimée.
        </p>
      ) : !confirme ? (
        <button
          type="button"
          className="inline-flex min-h-11 items-center justify-self-start text-base text-alerte underline-offset-4 hover:underline"
          onClick={() => setConfirme(true)}
        >
          Supprimer l’école
        </button>
      ) : (
        <div className="rounded-2xl bg-creme p-4">
          <p className="text-base text-encre">
            Supprimer {nomCourt(ecole)}
            {N}? Aucun membre n’y est rattaché. On ne peut pas revenir en arrière.
          </p>
          {supprimer.error && (
            <p role="alert" className="mt-2 text-base font-semibold text-alerte">
              {message(supprimer.error)}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
            <button type="button" className={boutonAlerte} disabled={supprimer.isPending} onClick={() => supprimer.mutate()}>
              {supprimer.isPending ? 'Suppression…' : 'Supprimer l’école'}
            </button>
            <button type="button" className={lienSimple} onClick={() => setConfirme(false)}>
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─────────── La page ─────────── */

export default function Ecoles() {
  const { isAdmin } = useAdminCheck()
  const queryClient = useQueryClient()
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['admin-schools'], queryFn: () => apiClient.getAdminSchools(), enabled: isAdmin })
  const [recherche, setRecherche] = useState('')
  const [choisie, setChoisie] = useState<string | null>(null)

  if (!isAdmin) return null

  const ecoles = trier(data ?? [])
  const t = recherche.trim().toLowerCase()
  const visibles = ecoles.filter((e) => !t || `${e.acronym ?? ''} ${e.name_fr} ${e.city} ${e.country}`.toLowerCase().includes(t))
  const active = choisie === NOUVELLE ? null : (visibles.find((x) => x.id === choisie) ?? visibles[0])
  const surLeSite = ecoles.filter((e) => e.acronym).length

  const nouvelle = (
    <div>
      <h2 className="font-titre text-2xl font-semibold tracking-[-0.02em] text-vert">Nouvelle école</h2>
      <div className="mt-5">
        <FormulaireEcole
          depart={VIDE}
          libelle="Ajouter l’école"
          onEnregistrer={async (b) => {
            const creee = await apiClient.createSchool(b)
            queryClient.setQueryData<AdminSchool[]>(['admin-schools'], (l) => [...(l ?? []), { ...creee, user_count: 0 }])
            queryClient.invalidateQueries({ queryKey: ['admin-schools'] })
            queryClient.invalidateQueries({ queryKey: ['schools'] })
            setRecherche('')
            setChoisie(creee.id)
          }}
          onAnnuler={() => setChoisie(null)}
        />
      </div>
    </div>
  )

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div>
          <h1 className="font-titre text-[clamp(2rem,3.4vw,2.8rem)] font-bold leading-[1.05] tracking-[-0.03em] text-vert">Les écoles</h1>
          <p className="mt-3 min-h-7 text-lg text-olive">
            {data &&
              `${ecoles.length.toLocaleString('fr-FR')} ${ecoles.length > 1 ? 'écoles' : 'école'}, dont ${surLeSite} ${surLeSite > 1 ? 'visibles' : 'visible'} sur le site.`}
          </p>
        </div>
        <button type="button" onClick={() => setChoisie(NOUVELLE)} className={boutonVert}>
          <Plus className="size-5" aria-hidden="true" />
          Ajouter une école
        </button>
      </div>

      <label className="relative mt-8 block">
        <span className="sr-only">Rechercher une école</span>
        <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-olive" aria-hidden="true" />
        <input
          type="search"
          value={recherche}
          onChange={(e) => {
            setRecherche(e.target.value)
            if (choisie !== NOUVELLE) setChoisie(null)
          }}
          placeholder="Sigle, nom, ville ou pays"
          className="h-14 w-full rounded-full bg-white pl-14 pr-6 text-base text-encre outline-none ring-vert/30 placeholder:text-olive focus-visible:ring-2"
        />
      </label>

      {choisie === NOUVELLE && <div className="mt-6 rounded-3xl bg-white p-5 lg:hidden">{nouvelle}</div>}

      {isLoading ? (
        <ul className="mt-6 grid gap-2 lg:w-[22rem]" aria-hidden="true">
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i} className="h-[4.5rem] animate-pulse rounded-2xl bg-sable/50" />
          ))}
        </ul>
      ) : isError ? (
        <div className="mt-6 rounded-3xl bg-white p-8 text-center">
          <p className="text-base text-olive">Les écoles n’ont pas pu être chargées.</p>
          <button type="button" onClick={() => refetch()} className={`${boutonVert} mt-4`}>
            Réessayer
          </button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
          <ul className="grid grid-cols-[minmax(0,1fr)] content-start gap-2">
            {visibles.map((x) => {
              const deplie = x.id === choisie // mobile
              const ici = x.id === active?.id // grand écran
              return (
                <li
                  key={x.id}
                  className={`rounded-2xl transition-colors ${deplie ? 'max-lg:bg-white max-lg:ring-2 max-lg:ring-vert' : 'max-lg:bg-white/60'} ${
                    ici ? 'lg:bg-white lg:ring-2 lg:ring-vert' : 'lg:bg-white/60 lg:hover:bg-white'
                  }`}
                >
                  <button
                    type="button"
                    aria-expanded={deplie}
                    onClick={() => setChoisie(grandEcran() ? x.id : deplie ? null : x.id)}
                    className="flex w-full items-center gap-3 px-5 py-4 text-left"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className={`truncate font-titre font-semibold tracking-[-0.02em] ${x.acronym ? 'text-vert' : 'text-olive'}`}>{nomCourt(x)}</span>
                        <Drapeau pays={x.country} className="h-3 w-auto" />
                      </span>
                      <span className="block truncate text-sm text-olive">{x.acronym ? x.name_fr : 'Sans sigle · absente du site'}</span>
                    </span>
                    <span className="shrink-0 text-sm tabular-nums text-olive">{membres(x.user_count)}</span>
                    <ChevronDown
                      className={`size-5 shrink-0 text-vert transition-transform duration-200 lg:hidden ${deplie ? 'rotate-180' : ''}`}
                      aria-hidden="true"
                    />
                  </button>
                  {deplie && (
                    <div className="px-5 pb-5 pt-1 lg:hidden">
                      <Detail ecole={x} onSupprimee={() => setChoisie(null)} />
                    </div>
                  )}
                </li>
              )
            })}
            {visibles.length === 0 && <li className="rounded-2xl bg-white p-6 text-center text-base text-olive">Aucune école ne correspond.</li>}
          </ul>
          <section aria-label="L’école choisie" className="hidden self-start rounded-3xl bg-white p-8 lg:sticky lg:top-6 lg:block">
            {choisie === NOUVELLE ? (
              nouvelle
            ) : active ? (
              <>
                <p className="flex items-center gap-2 text-sm text-olive">
                  <Drapeau pays={active.country} className="h-3.5 w-auto" /> {active.country} · {membres(active.user_count)}
                </p>
                <h2 className="mt-1 font-titre text-2xl font-semibold tracking-[-0.02em] text-vert">{nomCourt(active)}</h2>
                <div className="mt-6">
                  <Detail key={active.id} ecole={active} onSupprimee={() => setChoisie(null)} />
                </div>
              </>
            ) : null}
          </section>
        </div>
      )}
    </div>
  )
}
