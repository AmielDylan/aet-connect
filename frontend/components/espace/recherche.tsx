'use client'

// La recherche d'un AET dans l'annuaire : dans le menu sur mobile, en fenêtre sur ordinateur (bouton ou ⌘K).
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Loader2, Search, X } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { LienFleche } from '@/components/landing/lien-fleche'
import { Portrait } from './portrait'
import { ecoleCourte } from '@/types/directory'

const RESULTATS = 6

/** « promo 2005 keita » : l'année devient le filtre de promo, le reste la recherche par nom (l'API ne cherche que dans les noms) */
export function lireRecherche(saisie: string) {
  const mots = saisie.trim().split(/\s+/).filter(Boolean)
  const annee = mots.find((m) => /^(19|20)\d{2}$/.test(m))
  const reste = mots.filter((m) => m !== annee && !/^promo$/i.test(m)).join(' ')
  return { search: reste || undefined, entry_year: annee }
}

function useDiffere(valeur: string, delai = 300) {
  const [differe, setDiffere] = useState(valeur)
  useEffect(() => {
    const t = setTimeout(() => setDiffere(valeur), delai)
    return () => clearTimeout(t)
  }, [valeur, delai])
  return differe
}

/** Champ de recherche et résultats ; `tone` selon le fond (crème dans la fenêtre, vert dans le menu) */
export function Recherche({ tone, autoFocus, onNavigate }: { tone: 'creme' | 'vert'; autoFocus?: boolean; onNavigate?: () => void }) {
  const [saisie, setSaisie] = useState('')
  const terme = useDiffere(saisie.trim())
  const filtres = lireRecherche(terme)
  const actif = terme.length >= 2
  const { data, isFetching, isError } = useQuery({
    queryKey: ['recherche', filtres.search, filtres.entry_year],
    queryFn: () => apiClient.getMembers({ ...filtres, limit: RESULTATS }),
    enabled: actif,
    staleTime: 30_000,
  })
  const surVert = tone === 'vert'
  const secondaire = surVert ? 'text-brume' : 'text-olive'
  const membres = data?.users ?? []
  const annuaire = `/dashboard/directory?${new URLSearchParams({
    ...(filtres.search ? { q: filtres.search } : {}),
    ...(filtres.entry_year ? { year: filtres.entry_year } : {}),
  })}`

  return (
    <div role="search" className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3">
      <label htmlFor={`recherche-${tone}`} className="sr-only">
        Rechercher un AET
      </label>
      <div className="relative">
        <Search className={`pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 ${surVert ? 'text-vert' : 'text-olive'}`} aria-hidden="true" />
        <input
          id={`recherche-${tone}`}
          type="search"
          autoFocus={autoFocus}
          autoComplete="off"
          placeholder="Un nom, ou une promo (2005)"
          value={saisie}
          onChange={(e) => setSaisie(e.target.value)}
          className={`min-h-12 w-full appearance-none rounded-full border-2 pl-12 pr-11 text-base text-encre placeholder:text-olive [&::-webkit-search-cancel-button]:appearance-none ${
            surVert ? 'border-transparent bg-creme' : 'border-trait bg-white focus-visible:border-vert'
          }`}
        />
        {isFetching && <Loader2 className="absolute right-4 top-1/2 size-5 -translate-y-1/2 animate-spin text-olive" aria-hidden="true" />}
      </div>

      <div aria-live="polite" className="grid min-w-0 grid-cols-[minmax(0,1fr)]">
        {actif && isError && <p className={`px-2 text-base ${secondaire}`}>La recherche n’a pas abouti. Vous pouvez réessayer dans un instant.</p>}
        {actif && data && membres.length === 0 && (
          <p className={`px-2 text-base ${secondaire}`}>Personne ne correspond à « {terme} » pour le moment.</p>
        )}
        {actif && membres.length > 0 && (
          <>
            <ul className="grid grid-cols-[minmax(0,1fr)] gap-1">
              {membres.map((m) => (
                <li key={m.id}>
                  <Link
                    href={`/profile/${m.id}`}
                    onClick={onNavigate}
                    className={`group flex min-h-14 items-center gap-3 rounded-2xl px-2 transition-colors duration-200 ${surVert ? 'hover:bg-vert-carte' : 'hover:bg-white'}`}
                  >
                    <Portrait
                      prenom={m.first_name}
                      nom={m.last_name}
                      src={m.avatar_url}
                      className={`size-10 rounded-full text-sm ${surVert ? 'bg-creme text-vert' : 'bg-sable text-vert'}`}
                    />
                    <span className="min-w-0">
                      <span className={`block truncate text-base ${surVert ? 'text-creme group-hover:text-or' : 'text-encre group-hover:text-terre'}`}>
                        {m.first_name} {m.last_name}
                      </span>
                      <span className={`block truncate text-sm ${secondaire}`}>
                        {[ecoleCourte(m), m.entry_year && `promo ${m.entry_year}`, m.current_city].filter(Boolean).join(' · ')}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            {(data?.total ?? 0) > membres.length &&
              (surVert ? (
                <Link href={annuaire} onClick={onNavigate} className="mt-1 inline-flex min-h-11 items-center px-2 text-base text-creme hover:text-or hover:underline">
                  Voir les {data?.total} résultats dans l’annuaire
                </Link>
              ) : (
                <div className="mt-1 px-2" onClick={onNavigate}>
                  <LienFleche href={annuaire}>Voir les {data?.total} résultats dans l’annuaire</LienFleche>
                </div>
              ))}
          </>
        )}
      </div>
    </div>
  )
}

/** Le bouton loupe et la fenêtre de recherche (ordinateur) : <dialog> natif, Échap ferme, le focus reste dedans */
export function FenetreRecherche() {
  const dialog = useRef<HTMLDialogElement>(null)
  const [ouverte, setOuverte] = useState(false)
  const ouvrir = () => {
    if (dialog.current?.open) return
    dialog.current?.showModal()
    setOuverte(true)
  }
  const fermer = () => dialog.current?.close()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        ouvrir()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <button
        type="button"
        onClick={ouvrir}
        aria-label="Rechercher un AET"
        title="Rechercher un AET (⌘K)"
        className="grid size-11 place-items-center rounded-full text-vert transition-colors duration-200 hover:bg-sable/60 hover:text-terre"
      >
        <Search className="size-5" aria-hidden="true" />
      </button>
      <dialog
        ref={dialog}
        aria-labelledby="titre-recherche"
        onClose={() => setOuverte(false)}
        onClick={(e) => e.target === dialog.current && fermer()}
        className="sur-creme mx-auto mt-[12vh] w-[min(38rem,calc(100%-2rem))] rounded-3xl rounded-tr-[56px] bg-creme p-6 text-encre shadow-2xl backdrop:bg-vert-nuit/55 sm:p-8"
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 id="titre-recherche" className="font-titre text-xl font-semibold tracking-[-0.02em] text-vert">
            Rechercher un AET
          </h2>
          <button type="button" onClick={fermer} className="inline-flex min-h-11 items-center gap-1.5 text-base text-encre transition-colors hover:text-terre">
            <X className="size-4" aria-hidden="true" /> Fermer
          </button>
        </div>
        {/* Monté à chaque ouverture : le champ repart vide et prend le focus */}
        {ouverte && <Recherche tone="creme" autoFocus onNavigate={fermer} />}
      </dialog>
    </>
  )
}
