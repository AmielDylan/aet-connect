'use client'

// Proposition C · « Le registre » : une ligne par école (sigle et nom, pays et ville, fondation, membres), comme un
// registre qu'on parcourt d'un coup d'œil. « Modifier » et « Ajouter une école » ouvrent un volet à droite.
import { useEffect, useRef, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Drapeau, EnteteMaquette, FormulaireEcole, Recherche, SupprimerEcole, VIDE, brouillonDe, membres, nomCourt, useEcoles } from '../commun'

export default function PropositionC() {
  const e = useEcoles()
  const [ouverte, setOuverte] = useState<string | null>(null)
  const ref = useRef<HTMLDialogElement>(null)
  const ecole = e.ecoles.find((x) => x.id === ouverte)

  useEffect(() => {
    if (ouverte && !ref.current?.open) ref.current?.showModal()
    if (!ouverte && ref.current?.open) ref.current?.close()
  }, [ouverte])

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
            onClick={() => setOuverte('nouvelle')}
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-vert px-6 text-base font-semibold text-creme transition-colors hover:bg-vert-carte"
          >
            <Plus className="size-5" aria-hidden="true" />
            Ajouter une école
          </button>
        </div>
        <div className="mt-8">
          <Recherche e={e} />
        </div>

        <div className="mt-6 hidden grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_5rem_7rem_6rem] gap-4 px-6 text-sm text-olive lg:grid">
          <span>École</span>
          <span>Pays et ville</span>
          <span>Fondée</span>
          <span>Membres</span>
          <span />
        </div>
        <ul className="mt-2 grid gap-2">
          {e.visibles.map((x) => (
            <li
              key={x.id}
              className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 rounded-2xl px-5 py-4 sm:px-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_5rem_7rem_6rem] ${
                x.acronym ? 'bg-white' : 'bg-white/60'
              }`}
            >
              <div className="min-w-0">
                <p className={`font-titre font-semibold tracking-[-0.02em] ${x.acronym ? 'text-vert' : 'text-olive'}`}>{x.acronym ?? 'Sans sigle'}</p>
                <p className="truncate text-sm text-olive">{x.name_fr}</p>
              </div>
              <p className="col-start-1 text-sm text-encre lg:col-start-auto lg:text-base">
                <Drapeau pays={x.country} className="mr-1.5 h-3 w-auto align-[-1px]" />
                {x.country} · {x.city}
                <span className="text-olive lg:hidden">
                  {x.established_year && ` · ${x.established_year}`} · {membres(x.user_count)}
                </span>
              </p>
              <p className="hidden tabular-nums text-encre lg:block">{x.established_year ?? '—'}</p>
              <p className="hidden tabular-nums text-encre lg:block">{x.user_count.toLocaleString('fr-FR')}</p>
              <button
                type="button"
                onClick={() => setOuverte(x.id)}
                className="col-start-2 row-span-2 row-start-1 inline-flex min-h-11 items-center justify-self-end text-base text-encre hover:text-terre lg:col-start-auto lg:row-span-1 lg:row-start-auto"
              >
                Modifier<span className="sr-only"> {nomCourt(x)}</span>
              </button>
            </li>
          ))}
          {e.visibles.length === 0 && <li className="rounded-2xl bg-white p-6 text-center text-base text-olive">Aucune école ne correspond.</li>}
        </ul>
      </main>

      <dialog
        ref={ref}
        onClose={() => setOuverte(null)}
        aria-label={ecole ? `Modifier ${nomCourt(ecole)}` : 'Nouvelle école'}
        className="sur-creme fixed inset-y-0 left-auto right-0 m-0 h-full max-h-none w-[min(36rem,100vw)] overflow-y-auto rounded-l-3xl bg-creme p-6 text-encre backdrop:bg-encre/50 sm:p-8"
      >
        {ouverte && (
          <div className="grid gap-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                {ecole && (
                  <p className="flex items-center gap-2 text-sm text-olive">
                    <Drapeau pays={ecole.country} className="h-3.5 w-auto" /> {membres(ecole.user_count)}
                  </p>
                )}
                <h2 className="mt-1 font-titre text-2xl font-semibold tracking-[-0.02em] text-vert">{ecole ? nomCourt(ecole) : 'Nouvelle école'}</h2>
              </div>
              <button type="button" onClick={() => setOuverte(null)} className="grid size-11 place-items-center rounded-full text-vert hover:bg-sable/60" aria-label="Fermer">
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            {ecole ? (
              <>
                <FormulaireEcole key={ecole.id} depart={brouillonDe(ecole)} onEnregistrer={(b) => e.enregistrer(ecole.id, b)} />
                <SupprimerEcole
                  e={ecole}
                  onSupprimer={() => {
                    e.supprimer(ecole.id)
                    setOuverte(null)
                  }}
                />
              </>
            ) : (
              <FormulaireEcole depart={VIDE} libelle="Ajouter l’école" onEnregistrer={(b) => setOuverte(e.ajouter(b))} onAnnuler={() => setOuverte(null)} />
            )}
          </div>
        )}
      </dialog>
    </>
  )
}
