'use client'

// Proposition A · « Le trombinoscope » : les visages d'abord, comme une photo de promo ; les filtres en barre au-dessus.
import Link from 'next/link'
import { Drapeau } from '@/components/landing/drapeau'
import { Portrait } from '@/components/espace/portrait'
import { Aucun, ChampRecherche, Choix, EnteteMaquette, OPTIONS, Representant, TOTAL_RESEAU, useAnnuaire } from '../commun'

export default function PropositionA() {
  const { f, set, resultats, actifs, effacer } = useAnnuaire()
  return (
    <>
      <EnteteMaquette />
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-4 sm:px-8 sm:pt-8">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <h1 className="font-titre text-[clamp(2rem,3.6vw,3rem)] font-bold leading-[1.05] tracking-[-0.03em] text-vert">L’annuaire</h1>
          <p className="text-lg text-olive">
            {actifs ? (
              <>
                <span className="font-semibold text-vert">{resultats.length}</span> AET correspondent à votre recherche
              </>
            ) : (
              <>
                <span className="font-semibold text-vert">{TOTAL_RESEAU.toLocaleString('fr-FR')}</span> AET dans le réseau
              </>
            )}
          </p>
        </div>

        <div className="mt-8 grid gap-3 rounded-3xl bg-sable/45 p-4 sm:p-5 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <ChampRecherche valeur={f.q} onChange={(v) => set('q', v)} />
          <Choix label="École" cache valeur={f.ecole} onChange={(v) => set('ecole', v)} options={OPTIONS.ecole} tous="Écoles" />
          <Choix label="Promo" cache valeur={f.promo} onChange={(v) => set('promo', v)} options={OPTIONS.promo} tous="Promos" />
          <Choix label="Pays" cache valeur={f.pays} onChange={(v) => set('pays', v)} options={OPTIONS.pays} tous="Pays" />
          <Choix label="Ville" cache valeur={f.ville} onChange={(v) => set('ville', v)} options={OPTIONS.ville} tous="Villes" />
        </div>
        {actifs > 0 && (
          <button type="button" onClick={effacer} className="mt-2 inline-flex min-h-11 items-center text-base text-encre hover:text-terre hover:underline">
            Effacer les filtres
          </button>
        )}

        {resultats.length === 0 ? (
          <Aucun effacer={effacer} />
        ) : (
          <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
            {resultats.map((x) => (
              <li key={x.id}>
                <Link href="#" className="group block">
                  <Portrait
                    prenom={x.first_name}
                    nom={x.last_name}
                    className="aspect-[4/5] w-full rounded-2xl bg-sable text-3xl text-vert transition-colors duration-200 group-hover:bg-vert group-hover:text-creme"
                  />
                  <span className="mt-3 block text-base text-encre group-hover:text-terre">
                    {x.first_name} {x.last_name}
                  </span>
                  <span className="block text-sm text-olive">
                    {x.school_name} · {x.entry_year}
                  </span>
                  {x.current_city && (
                    <span className="mt-0.5 flex items-center gap-1.5 text-sm text-olive">
                      {x.current_city}
                      {x.current_country && <Drapeau pays={x.current_country} className="h-3 w-auto" />}
                    </span>
                  )}
                  {x.is_ambassador && (
                    <span className="mt-2 block">
                      <Representant />
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {resultats.length > 0 && (
          <div className="mt-12 grid justify-items-center gap-2">
            <p className="text-sm text-olive">{resultats.length} AET affichés sur {actifs ? resultats.length : TOTAL_RESEAU.toLocaleString('fr-FR')}</p>
            {!actifs && (
              <button
                type="button"
                className="inline-flex min-h-12 items-center rounded-full bg-vert px-7 text-base font-semibold text-creme transition-colors hover:bg-vert-carte"
              >
                Voir plus d’AET
              </button>
            )}
          </div>
        )}
      </main>
    </>
  )
}
