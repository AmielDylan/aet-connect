'use client'

// Proposition B · « Les cartes » : les écoles comme sur la page publique « Les écoles », une carte blanche chacune.
// « Modifier » ouvre la carte sur toute la largeur, ses champs à la place du texte. La dernière carte ajoute une école.
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Drapeau, EnteteMaquette, FormulaireEcole, Recherche, SupprimerEcole, VIDE, brouillonDe, membres, nomCourt, useEcoles } from '../commun'

export default function PropositionB() {
  const e = useEcoles()
  const [ouverte, setOuverte] = useState<string | null>(null)

  return (
    <>
      <EnteteMaquette />
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-4 sm:px-8 sm:pt-8">
        <h1 className="font-titre text-[clamp(2rem,3.4vw,2.8rem)] font-bold leading-[1.05] tracking-[-0.03em] text-vert">Les écoles</h1>
        <p className="mt-3 text-lg text-olive">
          {e.ecoles.length} écoles, dont {e.ecoles.filter((x) => x.acronym).length} visibles sur le site.
        </p>
        <div className="mt-8">
          <Recherche e={e} />
        </div>

        <ul className="mt-6 grid grid-flow-row-dense grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {e.visibles.map((x) =>
            ouverte === x.id ? (
              <li key={x.id} className="rounded-3xl bg-white p-5 ring-2 ring-vert sm:col-span-full sm:p-8">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <h2 className="font-titre text-2xl font-semibold tracking-[-0.02em] text-vert">Modifier {nomCourt(x)}</h2>
                  <p className="flex items-center gap-2 text-sm text-olive">
                    <Drapeau pays={x.country} className="h-3.5 w-auto" /> {membres(x.user_count)}
                  </p>
                </div>
                <div className="mt-5 grid gap-6">
                  <FormulaireEcole depart={brouillonDe(x)} onEnregistrer={(b) => e.enregistrer(x.id, b)} onAnnuler={() => setOuverte(null)} />
                  <SupprimerEcole
                    e={x}
                    onSupprimer={() => {
                      e.supprimer(x.id)
                      setOuverte(null)
                    }}
                  />
                </div>
              </li>
            ) : (
              <li key={x.id} className={`flex flex-col rounded-3xl p-5 sm:p-6 ${x.acronym ? 'bg-white' : 'bg-white/60'}`}>
                <p className="flex flex-wrap items-center gap-x-2 text-sm text-olive">
                  <Drapeau pays={x.country} className="h-3.5 w-auto" />
                  {x.country} · {x.city}
                  {x.established_year && ` · ${x.established_year}`}
                </p>
                <h2 className={`mt-3 font-titre text-2xl font-bold tracking-[-0.03em] ${x.acronym ? 'text-vert' : 'text-olive'}`}>
                  {x.acronym ?? 'Sans sigle'}
                </h2>
                <p className="mt-0.5 text-base leading-snug text-encre">{x.name_fr}</p>
                {!x.acronym && <p className="mt-2 text-sm text-terre">Absente du site tant qu’elle n’a pas de sigle.</p>}
                {x.description && <p className="mt-3 line-clamp-2 text-base leading-relaxed text-olive">{x.description}</p>}
                <div className="mt-auto flex flex-wrap items-end justify-between gap-x-4 pt-5">
                  <p className="text-base text-encre">
                    <span className="font-titre text-xl font-semibold tabular-nums tracking-[-0.03em] text-vert">{x.user_count}</span>{' '}
                    {x.user_count > 1 ? 'membres' : 'membre'}
                  </p>
                  <button type="button" onClick={() => setOuverte(x.id)} className="inline-flex min-h-11 items-center text-base text-encre hover:text-terre">
                    Modifier<span className="sr-only"> {nomCourt(x)}</span>
                  </button>
                </div>
              </li>
            ),
          )}
          {ouverte === 'nouvelle' ? (
            <li className="rounded-3xl bg-white p-5 ring-2 ring-vert sm:col-span-full sm:p-8">
              <h2 className="font-titre text-2xl font-semibold tracking-[-0.02em] text-vert">Nouvelle école</h2>
              <div className="mt-5">
                <FormulaireEcole depart={VIDE} libelle="Ajouter l’école" onEnregistrer={(b) => setOuverte(e.ajouter(b))} onAnnuler={() => setOuverte(null)} />
              </div>
            </li>
          ) : (
            <li>
              <button
                type="button"
                onClick={() => setOuverte('nouvelle')}
                className="flex h-full min-h-40 w-full flex-col items-center justify-center gap-2 rounded-3xl bg-sable/60 p-6 text-base font-semibold text-vert transition-colors hover:bg-sable"
              >
                <Plus className="size-6" aria-hidden="true" />
                Ajouter une école
              </button>
            </li>
          )}
        </ul>
      </main>
    </>
  )
}
