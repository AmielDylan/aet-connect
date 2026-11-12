'use client'

// Proposition A · « Le registre » : un membre par ligne (portrait, nom et email, école et promo, rôle, arrivée),
// comme un registre. « Gérer » déplie la ligne : le rôle, le statut d'ambassadeur, la suppression.
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Drapeau } from '@/components/landing/drapeau'
import { Portrait } from '@/components/espace/portrait'
import { ChoixAmbassadeurMembre, ChoixRole, EnteteMaquette, MOI_ID, Outils, Statut, Supprimer, depuis, invitations, nom, useMembres } from '../commun'

export default function PropositionA() {
  const e = useMembres()
  const [ouvert, setOuvert] = useState<string | null>(null)

  return (
    <>
      <EnteteMaquette />
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-4 sm:px-8 sm:pt-8">
        <h1 className="font-titre text-[clamp(2rem,3.4vw,2.8rem)] font-bold leading-[1.05] tracking-[-0.03em] text-vert">Les membres</h1>
        <p className="mt-3 text-lg text-olive">{e.membres.length} membres dans le réseau.</p>

        <div className="mt-8">
          <Outils e={e} />
        </div>

        <div className="mt-6 hidden grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_7rem_6rem] gap-4 px-6 text-sm text-olive lg:grid">
          <span>Membre</span>
          <span>École et promo</span>
          <span>Rôle</span>
          <span>Arrivée</span>
          <span />
        </div>
        <ul className="mt-2 grid gap-2">
          {e.visibles.map((m) => {
            const deplie = ouvert === m.id
            const moi = m.id === MOI_ID
            return (
              <li key={m.id} className={`rounded-2xl bg-white ${deplie ? 'ring-2 ring-vert' : ''}`}>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-4 py-3 sm:px-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_7rem_6rem]">
                  <div className="flex min-w-0 items-center gap-3">
                    <Portrait prenom={m.first_name} nom={m.last_name} className="size-10 shrink-0 rounded-full bg-vert text-sm text-creme" />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-vert">
                        {nom(m)} {moi && <span className="font-normal text-olive">· vous</span>}
                      </p>
                      <p className="truncate text-sm text-olive">{m.email}</p>
                    </div>
                  </div>
                  <p className="col-start-1 flex items-center gap-2 pl-[3.25rem] text-sm text-encre lg:col-start-auto lg:pl-0 lg:text-base">
                    {m.ecole} <Drapeau pays={m.pays} className="h-3 w-auto" /> · {m.entry_year}
                  </p>
                  <p className="col-start-1 pl-[3.25rem] text-sm lg:col-start-auto lg:pl-0 lg:text-base">
                    <Statut m={m} />
                    {m.role === 'alumni' && !m.is_ambassador && <span className="hidden text-olive lg:inline">Membre</span>}
                  </p>
                  <p className="hidden text-sm text-olive lg:block">{depuis(m.created_at)}</p>
                  <button
                    type="button"
                    aria-expanded={deplie}
                    onClick={() => setOuvert(deplie ? null : m.id)}
                    className="col-start-2 row-span-3 row-start-1 inline-flex min-h-11 items-center gap-1 justify-self-end text-base text-encre hover:text-terre lg:col-start-auto lg:row-span-1 lg:row-start-auto"
                  >
                    Gérer
                    <ChevronDown className={`size-[18px] transition-transform ${deplie ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>
                </div>
                {deplie && (
                  <div className="grid gap-6 px-4 pb-5 pt-2 sm:px-6 lg:grid-cols-2">
                    <div className="grid content-start gap-5">
                      <ChoixRole m={m} e={e} moi={moi} />
                      <ChoixAmbassadeurMembre m={m} e={e} />
                    </div>
                    <div className="grid content-start gap-3 text-base">
                      <p className="text-olive">
                        Arrivée {depuis(m.created_at)} · {invitations(m)}
                        {m.current_city && ` · vit à ${m.current_city}`}
                      </p>
                      <a href="#" className="inline-flex min-h-11 items-center text-encre hover:text-terre">
                        Voir son profil
                      </a>
                      <Supprimer m={m} e={e} moi={moi} onFait={() => setOuvert(null)} />
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
        {e.visibles.length === 0 && <p className="mt-4 rounded-2xl bg-white p-8 text-center text-base text-olive">Aucun membre ne correspond.</p>}
        <p className="mt-6 text-center text-sm text-olive">50 membres par page · « Voir plus de membres » en bas de liste</p>
      </main>
    </>
  )
}
