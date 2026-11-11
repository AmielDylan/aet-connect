'use client'

// Proposition B · « Le registre » : une liste dense et lisible, les filtres dans une colonne fixe à gauche.
import Link from 'next/link'
import { ArrowRight, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import { Drapeau } from '@/components/landing/drapeau'
import { Portrait } from '@/components/espace/portrait'
import { Aucun, ChampRecherche, Choix, EnteteMaquette, OPTIONS, Representant, TOTAL_RESEAU, useAnnuaire } from '../commun'

export default function PropositionB() {
  const { f, set, resultats, actifs, effacer } = useAnnuaire()
  const [filtresOuverts, setFiltresOuverts] = useState(false)
  const filtres = (
    <div className="grid gap-4">
      <Choix label="École" valeur={f.ecole} onChange={(v) => set('ecole', v)} options={OPTIONS.ecole} tous="Toutes" />
      <Choix label="Promo" valeur={f.promo} onChange={(v) => set('promo', v)} options={OPTIONS.promo} tous="Toutes" />
      <Choix label="Pays" valeur={f.pays} onChange={(v) => set('pays', v)} options={OPTIONS.pays} tous="Tous" />
      <Choix label="Ville" valeur={f.ville} onChange={(v) => set('ville', v)} options={OPTIONS.ville} tous="Toutes" />
      {actifs > 0 && (
        <button type="button" onClick={effacer} className="inline-flex min-h-11 items-center justify-self-start text-base text-encre hover:text-terre hover:underline">
          Effacer les filtres
        </button>
      )}
    </div>
  )
  return (
    <>
      <EnteteMaquette />
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-4 sm:px-8 sm:pt-8">
        <h1 className="font-titre text-[clamp(2rem,3.6vw,3rem)] font-bold leading-[1.05] tracking-[-0.03em] text-vert">L’annuaire</h1>
        <p className="mt-2 text-lg text-olive">{TOTAL_RESEAU.toLocaleString('fr-FR')} AET, de toutes les écoles et de toutes les promos.</p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[16rem_1fr] lg:items-start">
          <aside aria-label="Filtres" className="lg:sticky lg:top-6">
            <ChampRecherche valeur={f.q} onChange={(v) => set('q', v)} />
            <button
              type="button"
              onClick={() => setFiltresOuverts(!filtresOuverts)}
              aria-expanded={filtresOuverts}
              className="mt-3 inline-flex min-h-11 items-center gap-2 text-base text-encre lg:hidden"
            >
              <SlidersHorizontal className="size-[18px]" aria-hidden="true" />
              Filtres{actifs ? ` (${actifs})` : ''}
            </button>
            <div className={`mt-5 rounded-3xl bg-sable/45 p-5 ${filtresOuverts ? '' : 'hidden'} lg:block`}>{filtres}</div>
          </aside>

          <section aria-label="Résultats">
            <p className="text-base text-olive" aria-live="polite">
              {actifs ? `${resultats.length} AET correspondent à votre recherche` : `Les ${resultats.length} derniers inscrits`}
            </p>
            {resultats.length === 0 ? (
              <Aucun effacer={effacer} />
            ) : (
              <ul className="mt-4 grid gap-2">
                {resultats.map((x) => (
                  <li key={x.id}>
                    <Link href="#" className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl bg-white p-3 pr-5 transition-colors hover:bg-white/70">
                      <Portrait prenom={x.first_name} nom={x.last_name} className="size-14 rounded-xl bg-sable text-base text-vert" />
                      <span className="grid min-w-0 gap-0.5 sm:grid-cols-[1.2fr_1fr] sm:items-center sm:gap-6">
                        <span className="min-w-0">
                          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="text-base font-semibold text-encre group-hover:text-terre">
                              {x.first_name} {x.last_name}
                            </span>
                            {x.is_ambassador && <Representant />}
                          </span>
                          <span className="block truncate text-sm text-olive">
                            {x.school_name} · promo {x.entry_year}
                          </span>
                        </span>
                        {x.current_city && (
                          <span className="flex items-center gap-2 text-sm text-olive">
                            {x.current_country && <Drapeau pays={x.current_country} className="h-3 w-auto" />}
                            {[x.current_city, x.current_country].filter(Boolean).join(', ')}
                          </span>
                        )}
                      </span>
                      <ArrowRight className="size-[18px] text-terre opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {resultats.length > 0 && (
              <nav aria-label="Pages" className="mt-8 flex items-center justify-between gap-4">
                <span className="text-sm text-olive">Page 1 sur 74</span>
                <span className="flex gap-6">
                  <span className="inline-flex min-h-11 items-center text-base text-olive/60">Précédente</span>
                  <Link href="#" className="inline-flex min-h-11 items-center text-base text-encre hover:text-terre hover:underline">
                    Suivante
                  </Link>
                </span>
              </nav>
            )}
          </section>
        </div>
      </main>
    </>
  )
}
