'use client'

// Proposition C · « La recherche » : un bandeau vert avec un grand champ et des raccourcis (ma promo, mon école,
// ma ville), puis des fiches horizontales.
import Link from 'next/link'
import { Drapeau } from '@/components/landing/drapeau'
import { Portrait } from '@/components/espace/portrait'
import { Aucun, ChampRecherche, Choix, EnteteMaquette, MOI, OPTIONS, Representant, TOTAL_RESEAU, VIDE, useAnnuaire } from '../commun'

export default function PropositionC() {
  const { f, set, setF, resultats, actifs, effacer } = useAnnuaire()
  const RACCOURCIS = [
    { label: 'Ma promo', actif: f.ecole === MOI.ecole && f.promo === MOI.promo, applique: () => setF({ ...VIDE, ecole: MOI.ecole, promo: MOI.promo }) },
    { label: 'Mon école', actif: f.ecole === MOI.ecole && !f.promo, applique: () => setF({ ...VIDE, ecole: MOI.ecole }) },
    { label: 'Ma ville', actif: f.ville === MOI.ville, applique: () => setF({ ...VIDE, ville: MOI.ville }) },
  ]
  return (
    <>
      <EnteteMaquette />
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-4 sm:px-8 sm:pt-8">
        <section className="sur-vert trame trame-sur-vert rounded-3xl rounded-tr-[56px] bg-vert px-6 py-10 text-creme sm:px-10 md:rounded-tr-[76px] lg:px-12 lg:py-12">
          <h1 className="font-titre text-[clamp(2rem,3.4vw,2.8rem)] font-bold leading-[1.05] tracking-[-0.03em]">Retrouver un AET</h1>
          <p className="mt-3 max-w-[48ch] text-lg leading-relaxed text-brume">
            <span className="font-semibold text-or">{TOTAL_RESEAU.toLocaleString('fr-FR')}</span> AET, de toutes les écoles et de toutes les promos.
          </p>
          <div className="mt-7 max-w-2xl">
            <ChampRecherche grand valeur={f.q} onChange={(v) => set('q', v)} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {RACCOURCIS.map((r) => (
              <button
                key={r.label}
                type="button"
                aria-pressed={r.actif}
                onClick={r.actif ? effacer : r.applique}
                className={`inline-flex min-h-11 items-center rounded-full px-5 text-base transition-colors ${
                  r.actif ? 'bg-creme text-vert' : 'bg-vert-carte text-creme hover:text-or'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </section>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Choix label="École" cache valeur={f.ecole} onChange={(v) => set('ecole', v)} options={OPTIONS.ecole} tous="Écoles" />
          <Choix label="Promo" cache valeur={f.promo} onChange={(v) => set('promo', v)} options={OPTIONS.promo} tous="Promos" />
          <Choix label="Pays" cache valeur={f.pays} onChange={(v) => set('pays', v)} options={OPTIONS.pays} tous="Pays" />
          <Choix label="Ville" cache valeur={f.ville} onChange={(v) => set('ville', v)} options={OPTIONS.ville} tous="Villes" />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-base text-olive" aria-live="polite">
            {actifs ? `${resultats.length} AET correspondent` : 'Les derniers inscrits'}
          </p>
          {actifs > 0 && (
            <button type="button" onClick={effacer} className="inline-flex min-h-11 items-center text-base text-encre hover:text-terre hover:underline">
              Effacer les filtres
            </button>
          )}
        </div>

        {resultats.length === 0 ? (
          <Aucun effacer={effacer} />
        ) : (
          <ul className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {resultats.map((x) => (
              <li key={x.id}>
                <Link href="#" className="group flex h-full items-center gap-4 rounded-3xl bg-white p-4 transition-colors">
                  <Portrait
                    prenom={x.first_name}
                    nom={x.last_name}
                    className="size-20 shrink-0 rounded-2xl bg-sable text-xl text-vert transition-colors group-hover:bg-vert group-hover:text-creme"
                  />
                  <span className="min-w-0">
                    <span className="block text-base font-semibold text-encre group-hover:text-terre">
                      {x.first_name} {x.last_name}
                    </span>
                    <span className="block text-sm text-olive">
                      {x.school_name} · promo {x.entry_year}
                    </span>
                    {x.current_city && (
                      <span className="mt-0.5 flex items-center gap-1.5 text-sm text-olive">
                        {x.current_country && <Drapeau pays={x.current_country} className="h-3 w-auto" />}
                        {x.current_city}
                      </span>
                    )}
                    {x.is_ambassador && (
                      <span className="mt-1.5 block">
                        <Representant />
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  )
}
