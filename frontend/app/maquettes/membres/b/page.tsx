'use client'

// Proposition B · « Les fiches » : les membres en fiches, comme dans l'annuaire (portrait, nom, école et promo,
// rôle). Une fiche ouvre un volet à droite, où l'on gère le rôle, le statut d'ambassadeur et le compte.
import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { Drapeau } from '@/components/landing/drapeau'
import { Portrait } from '@/components/espace/portrait'
import {
  ChoixAmbassadeurMembre, ChoixRole, EnteteMaquette, MOI_ID, Outils, Statut, Supprimer, depuis, invitations, nom, useMembres, type Membre,
} from '../commun'

export default function PropositionB() {
  const e = useMembres()
  const [choisi, setChoisi] = useState<string | null>(null)
  const ref = useRef<HTMLDialogElement>(null)
  const m: Membre | undefined = e.membres.find((x) => x.id === choisi)

  useEffect(() => {
    if (choisi && !ref.current?.open) ref.current?.showModal()
    if (!choisi && ref.current?.open) ref.current?.close()
  }, [choisi])

  return (
    <>
      <EnteteMaquette />
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-4 sm:px-8 sm:pt-8">
        <h1 className="font-titre text-[clamp(2rem,3.4vw,2.8rem)] font-bold leading-[1.05] tracking-[-0.03em] text-vert">Les membres</h1>
        <p className="mt-3 text-lg text-olive">{e.membres.length} membres dans le réseau.</p>

        <div className="mt-8">
          <Outils e={e} />
        </div>

        <ul className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {e.visibles.map((x) => (
            <li key={x.id}>
              <button
                type="button"
                onClick={() => setChoisi(x.id)}
                className="group flex w-full items-center gap-4 rounded-3xl bg-white p-4 text-left transition-shadow hover:ring-2 hover:ring-vert/20 sm:p-5"
              >
                <Portrait prenom={x.first_name} nom={x.last_name} className="size-14 shrink-0 rounded-2xl bg-vert text-base text-creme" />
                <span className="min-w-0">
                  <span className="block truncate font-titre text-base font-semibold tracking-[-0.02em] text-vert group-hover:text-terre">
                    {nom(x)}
                    {x.id === MOI_ID && <span className="font-texte font-normal text-olive"> · vous</span>}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-olive">
                    {x.ecole} <Drapeau pays={x.pays} className="h-3 w-auto" /> · {x.entry_year}
                  </span>
                  <Statut m={x} className="block text-sm" />
                </span>
              </button>
            </li>
          ))}
        </ul>
        {e.visibles.length === 0 && <p className="mt-4 rounded-3xl bg-white p-8 text-center text-base text-olive">Aucun membre ne correspond.</p>}
        <p className="mt-6 text-center text-sm text-olive">50 membres par page · « Voir plus de membres » en bas de liste</p>
      </main>

      <dialog
        ref={ref}
        onClose={() => setChoisi(null)}
        aria-label={m ? `Gérer ${nom(m)}` : 'Gérer un membre'}
        className="sur-creme fixed inset-y-0 left-auto right-0 m-0 h-full max-h-none w-[min(30rem,100vw)] overflow-y-auto rounded-l-3xl bg-creme p-6 text-encre backdrop:bg-encre/50 sm:p-8"
      >
        {m && (
          <div className="grid gap-6">
            <div className="flex items-start justify-between gap-4">
              <Portrait prenom={m.first_name} nom={m.last_name} className="size-20 rounded-3xl rounded-tr-[32px] bg-vert text-xl text-creme" />
              <button type="button" onClick={() => setChoisi(null)} className="grid size-11 place-items-center rounded-full text-vert hover:bg-sable/60" aria-label="Fermer">
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <div>
              <h2 className="font-titre text-2xl font-semibold tracking-[-0.02em] text-vert">{nom(m)}</h2>
              <p className="mt-1 flex items-center gap-2 text-base text-encre">
                {m.ecole} <Drapeau pays={m.pays} className="h-3.5 w-auto" /> · promo {m.entry_year}
              </p>
              <p className="mt-0.5 break-all text-base text-olive">{m.email}</p>
              <p className="mt-3 text-sm text-olive">
                Arrivée {depuis(m.created_at)} · {invitations(m)}
              </p>
            </div>
            <div className="grid gap-5 rounded-3xl bg-white p-5">
              <ChoixRole m={m} e={e} moi={m.id === MOI_ID} />
              <ChoixAmbassadeurMembre m={m} e={e} />
            </div>
            <div className="grid gap-2">
              <a href="#" className="inline-flex min-h-11 items-center text-base text-encre hover:text-terre">
                Voir son profil
              </a>
              <Supprimer m={m} e={e} moi={m.id === MOI_ID} onFait={() => setChoisi(null)} />
            </div>
          </div>
        )}
      </dialog>
    </>
  )
}
