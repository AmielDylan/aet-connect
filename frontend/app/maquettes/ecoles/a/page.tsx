'use client'

// Proposition A · « Le tri » : comme les demandes et les membres, la liste des écoles à gauche et l'école choisie à
// droite, ses champs modifiables sur place. « Ajouter une école » ouvre un formulaire vide au même endroit.
// Sur mobile, chaque école se déplie dans la liste.
import { useState } from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import { Drapeau, EnteteMaquette, FormulaireEcole, Recherche, SupprimerEcole, VIDE, brouillonDe, membres, nomCourt, useEcoles, type Ecole, type Etat } from '../commun'

const NOUVELLE = 'nouvelle'
const grandEcran = () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches

function Detail({ ecole, e, onFin }: { ecole: Ecole; e: Etat; onFin: () => void }) {
  return (
    <div className="grid gap-6">
      <FormulaireEcole key={ecole.id} depart={brouillonDe(ecole)} onEnregistrer={(b) => e.enregistrer(ecole.id, b)} />
      <SupprimerEcole
        e={ecole}
        onSupprimer={() => {
          e.supprimer(ecole.id)
          onFin()
        }}
      />
    </div>
  )
}

export default function PropositionA() {
  const e = useEcoles()
  const [choisie, setChoisie] = useState<string | null>(null)
  const active = choisie === NOUVELLE ? null : (e.visibles.find((x) => x.id === choisie) ?? e.visibles[0])

  const nouvelle = (
    <div>
      <h2 className="font-titre text-2xl font-semibold tracking-[-0.02em] text-vert">Nouvelle école</h2>
      <div className="mt-5">
        <FormulaireEcole
          depart={VIDE}
          libelle="Ajouter l’école"
          onEnregistrer={(b) => setChoisie(e.ajouter(b))}
          onAnnuler={() => setChoisie(null)}
        />
      </div>
    </div>
  )

  return (
    <>
      <EnteteMaquette />
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-4 sm:px-8 sm:pt-8">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div>
            <h1 className="font-titre text-[clamp(2rem,3.4vw,2.8rem)] font-bold leading-[1.05] tracking-[-0.03em] text-vert">Les écoles</h1>
            <p className="mt-3 text-lg text-olive">
              {e.ecoles.length} écoles, dont {e.ecoles.filter((x) => x.acronym).length} visibles sur le site.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setChoisie(NOUVELLE)}
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-vert px-6 text-base font-semibold text-creme transition-colors hover:bg-vert-carte"
          >
            <Plus className="size-5" aria-hidden="true" />
            Ajouter une école
          </button>
        </div>

        <div className="mt-8">
          <Recherche e={e} />
        </div>

        {choisie === NOUVELLE && <div className="mt-6 rounded-3xl bg-white p-5 lg:hidden">{nouvelle}</div>}

        <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
          <ul className="grid grid-cols-[minmax(0,1fr)] content-start gap-2">
            {e.visibles.map((x) => {
              const deplie = x.id === choisie
              const ici = x.id === active?.id
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
                        <span className={`font-titre font-semibold tracking-[-0.02em] ${x.acronym ? 'text-vert' : 'text-olive'}`}>{nomCourt(x)}</span>
                        <Drapeau pays={x.country} className="h-3 w-auto" />
                      </span>
                      <span className="block truncate text-sm text-olive">
                        {x.acronym ? x.name_fr : 'Sans sigle · absente du site'}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm tabular-nums text-olive">{membres(x.user_count)}</span>
                    <ChevronDown className={`size-5 shrink-0 text-vert transition-transform duration-200 lg:hidden ${deplie ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>
                  {deplie && (
                    <div className="px-5 pb-5 pt-1 lg:hidden">
                      <Detail ecole={x} e={e} onFin={() => setChoisie(null)} />
                    </div>
                  )}
                </li>
              )
            })}
            {e.visibles.length === 0 && <li className="rounded-2xl bg-white p-6 text-center text-base text-olive">Aucune école ne correspond.</li>}
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
                  <Detail ecole={active} e={e} onFin={() => setChoisie(null)} />
                </div>
              </>
            ) : null}
          </section>
        </div>
      </main>
    </>
  )
}
