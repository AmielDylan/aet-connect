'use client'

// L'annuaire · proposition C « La recherche » : un bandeau vert avec un grand champ et des raccourcis
// (ma promo, mon école, ma ville), les filtres, puis des fiches horizontales, 24 par 24.
// L'adresse peut préremplir la recherche : ?q= (recherche de l'en-tête), ?school=&year= (« Voir toute la promo »).
import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { ChevronDown, Loader2, Search } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/hooks/use-auth'
import { Drapeau } from '@/components/landing/drapeau'
import { Portrait } from '@/components/espace/portrait'
import { lireRecherche } from '@/components/espace/recherche'
import { ecoleCourte } from '@/types/directory'

const PAR_PAGE = 24
type Filtres = { q: string; school: string; year: string; country: string; city: string }
const VIDE: Filtres = { q: '', school: '', year: '', country: '', city: '' }

export default function AnnuairePage() {
  return (
    <Suspense fallback={null}>
      <Annuaire />
    </Suspense>
  )
}

/** Liste déroulante native, au style des champs du site */
function Choix({ label, valeur, onChange, options, tous }: { label: string; valeur: string; onChange: (v: string) => void; options: { value: string; label: string }[]; tous: string }) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <select
        value={valeur}
        onChange={(e) => onChange(e.target.value)}
        className={`min-h-11 w-full cursor-pointer appearance-none rounded-full border-2 bg-white pl-4 pr-10 text-base text-encre hover:border-olive focus-visible:border-vert ${
          valeur ? 'border-vert' : 'border-trait'
        }`}
      >
        <option value="">{tous}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-[18px] -translate-y-1/2 text-vert" aria-hidden="true" />
    </label>
  )
}

function Annuaire() {
  const params = useSearchParams()
  const { user } = useAuth()
  const [f, setF] = useState<Filtres>({ ...VIDE, q: params.get('q') ?? '', school: params.get('school') ?? '', year: params.get('year') ?? '' })
  const set = (k: keyof Filtres, v: string) => setF((p) => ({ ...p, [k]: v, ...(k === 'school' ? { year: '' } : {}) }))

  // La saisie attend un instant avant de chercher
  const [q, setQ] = useState(f.q)
  useEffect(() => {
    const t = setTimeout(() => setQ(f.q.trim()), 300)
    return () => clearTimeout(t)
  }, [f.q])

  const lu = lireRecherche(q)
  const requete = {
    search: lu.search,
    entry_year: f.year || lu.entry_year,
    school_id: f.school || undefined,
    country: f.country || undefined,
    city: f.city || undefined,
  }
  const actifs = [q, f.school, f.year, f.country, f.city].filter(Boolean).length

  const membres = useInfiniteQuery({
    queryKey: ['annuaire', requete],
    queryFn: ({ pageParam }) => apiClient.getMembers({ ...requete, limit: PAR_PAGE, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (dernier, pages) => {
      const charges = pages.reduce((n, p) => n + p.users.length, 0)
      return charges < dernier.total ? charges : undefined
    },
  })
  const { data: reseau } = useQuery({ queryKey: ['annuaire-total'], queryFn: () => apiClient.getMembers({ limit: 1 }) })
  const { data: ecoles } = useQuery({ queryKey: ['schools'], queryFn: () => apiClient.getSchools() })
  const { data: annees } = useQuery({ queryKey: ['filter-years', f.school], queryFn: () => apiClient.getFilterYears(f.school || undefined) })
  const { data: pays } = useQuery({ queryKey: ['filter-countries'], queryFn: () => apiClient.getFilterCountries() })
  const { data: villes } = useQuery({ queryKey: ['filter-cities'], queryFn: () => apiClient.getFilterCities() })

  const liste = membres.data?.pages.flatMap((p) => p.users) ?? []
  const total = membres.data?.pages[0]?.total ?? 0

  const RACCOURCIS = [
    user?.school_id && user.entry_year
      ? { label: 'Ma promo', actif: f.school === user.school_id && f.year === user.entry_year, applique: { ...VIDE, school: user.school_id, year: user.entry_year } }
      : null,
    user?.school_id ? { label: 'Mon école', actif: f.school === user.school_id && !f.year, applique: { ...VIDE, school: user.school_id } } : null,
    user?.current_city ? { label: 'Ma ville', actif: f.city === user.current_city, applique: { ...VIDE, city: user.current_city } } : null,
  ].filter(Boolean) as { label: string; actif: boolean; applique: Filtres }[]

  return (
    <div>
      <section className="sur-vert trame trame-sur-vert rounded-3xl rounded-tr-[56px] bg-vert px-6 py-10 text-creme sm:px-10 md:rounded-tr-[76px] lg:px-12 lg:py-12">
        <h1 className="font-titre text-[clamp(2rem,3.4vw,2.8rem)] font-bold leading-[1.05] tracking-[-0.03em]">Retrouver un AET</h1>
        {reseau && (
          <p className="mt-3 max-w-[48ch] text-lg leading-relaxed text-brume">
            <span className="font-semibold text-or">{reseau.total.toLocaleString('fr-FR')}</span> AET, de toutes les écoles et de toutes les promos.
          </p>
        )}
        <label className="relative mt-7 block max-w-2xl">
          <span className="sr-only">Rechercher un AET par son nom ou sa promo</span>
          <Search className="pointer-events-none absolute left-5 top-1/2 size-6 -translate-y-1/2 text-olive" aria-hidden="true" />
          <input
            type="search"
            value={f.q}
            onChange={(e) => set('q', e.target.value)}
            placeholder="Un nom, ou une promo (2005)"
            autoComplete="off"
            className="min-h-14 w-full appearance-none rounded-full border-2 border-transparent bg-white pl-14 pr-5 text-lg text-encre placeholder:text-olive [&::-webkit-search-cancel-button]:appearance-none"
          />
        </label>
        {RACCOURCIS.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {RACCOURCIS.map((r) => (
              <button
                key={r.label}
                type="button"
                aria-pressed={r.actif}
                onClick={() => setF(r.actif ? VIDE : r.applique)}
                className={`inline-flex min-h-11 items-center rounded-full px-5 text-base transition-colors ${
                  r.actif ? 'bg-creme text-vert' : 'bg-vert-carte text-creme hover:text-or'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        )}
      </section>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Choix
          label="École"
          tous="Écoles"
          valeur={f.school}
          onChange={(v) => set('school', v)}
          options={(ecoles?.schools ?? []).map((s) => ({ value: s.id, label: s.acronym ? `${s.acronym} · ${s.city}` : s.name_fr }))}
        />
        <Choix label="Promo" tous="Promos" valeur={f.year} onChange={(v) => set('year', v)} options={(annees?.years ?? []).map((y) => ({ value: y, label: `Promo ${y}` }))} />
        <Choix label="Pays de l’école" tous="Pays de l’école" valeur={f.country} onChange={(v) => set('country', v)} options={(pays?.countries ?? []).map((c) => ({ value: c, label: c }))} />
        <Choix label="Ville" tous="Villes" valeur={f.city} onChange={(v) => set('city', v)} options={(villes?.cities ?? []).map((c) => ({ value: c, label: c }))} />
      </div>

      <div className="mt-6 flex min-h-11 flex-wrap items-center justify-between gap-3">
        <p className="text-base text-olive" aria-live="polite">
          {membres.isLoading
            ? 'Recherche…'
            : membres.isError
              ? ''
              : actifs
              ? `${total.toLocaleString('fr-FR')} AET ${total > 1 ? 'correspondent' : 'correspond'} à votre recherche`
              : 'Les derniers inscrits'}
        </p>
        {actifs > 0 && (
          <button type="button" onClick={() => setF(VIDE)} className="inline-flex min-h-11 items-center text-base text-encre hover:text-terre hover:underline">
            Effacer les filtres
          </button>
        )}
      </div>

      {membres.isLoading ? (
        <ul className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i} className="h-28 animate-pulse rounded-3xl bg-sable/60" />
          ))}
        </ul>
      ) : membres.isError ? (
        <p className="mt-6 text-base text-olive">L’annuaire n’a pas pu être chargé. Vous pouvez recharger la page dans un instant.</p>
      ) : liste.length === 0 ? (
        <div className="mt-6 rounded-3xl bg-white p-8 text-center">
          <p className="text-lg text-encre">Personne ne correspond à cette recherche pour le moment.</p>
          <p className="mt-1 text-base text-olive">La recherche porte sur les noms et les promos ; les filtres sont peut-être trop précis.</p>
          {actifs > 0 && (
            <button type="button" onClick={() => setF(VIDE)} className="mt-4 inline-flex min-h-11 items-center text-base text-encre hover:text-terre hover:underline">
              Effacer les filtres
            </button>
          )}
        </div>
      ) : (
        <>
          <ul className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {liste.map((x) => (
              <li key={x.id}>
                <Link href={`/profile/${x.id}`} className="group flex h-full items-center gap-4 rounded-3xl bg-white p-4">
                  <Portrait
                    prenom={x.first_name}
                    nom={x.last_name}
                    src={x.avatar_url}
                    className="size-20 shrink-0 rounded-2xl bg-sable text-xl text-vert transition-colors group-hover:bg-vert group-hover:text-creme"
                  />
                  <span className="min-w-0">
                    <span className="block text-base font-semibold text-encre group-hover:text-terre">
                      {x.first_name} {x.last_name}
                    </span>
                    <span className="block text-sm text-olive">{[ecoleCourte(x), x.entry_year && `promo ${x.entry_year}`].filter(Boolean).join(' · ')}</span>
                    {x.current_city && (
                      <span className="mt-0.5 flex items-center gap-1.5 text-sm text-olive">
                        {x.current_country && <Drapeau pays={x.current_country} className="h-3 w-auto" />}
                        {x.current_city}
                      </span>
                    )}
                    {x.is_ambassador && (
                      <span className="mt-1.5 block">
                        <span className="rounded-full bg-terre/10 px-2.5 py-0.5 text-xs font-semibold text-terre">Représente sa promo</span>
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {membres.hasNextPage && (
            <div className="mt-10 grid justify-items-center">
              <button
                type="button"
                onClick={() => membres.fetchNextPage()}
                disabled={membres.isFetchingNextPage}
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-vert px-7 text-base font-semibold text-creme transition-colors hover:bg-vert-carte disabled:opacity-60"
              >
                {membres.isFetchingNextPage && <Loader2 className="size-[18px] animate-spin" aria-hidden="true" />}
                Voir plus d’AET
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
