'use client'

// Proposition A · « Le tri » : comme les autres pages de l'administration, la liste à gauche et la demande choisie à
// droite (le membre, sa raison), où l'on décide : supprimer le compte ou le garder. Sur mobile, chaque demande se déplie.
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Decision, Drapeau, EnteteMaquette, Filtres, N, depuis, issue, optionsFiltre, useSuppressions, type Filtre, type Suppression } from '../commun'

const grandEcran = () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches

function Detail({ d, e, entete = true }: { d: Suppression; e: ReturnType<typeof useSuppressions>; entete?: boolean }) {
  return (
    <div className="grid gap-6">
      {entete && (
        <div>
          <p className="text-sm text-olive">Demande reçue {depuis(d.created_at)}</p>
          <h2 className="mt-1 font-titre text-2xl font-semibold tracking-[-0.02em] text-vert">{d.requester_name}</h2>
        </div>
      )}
      <dl className="grid gap-x-6 text-base sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-y-3 [&>dt:first-child]:mt-0 [&>dt]:mt-3 [&>dt]:text-sm sm:[&>dt]:mt-0 sm:[&>dt]:text-base">
        {d.membre && (
          <>
            <dt className="text-olive">École</dt>
            <dd className="flex items-center gap-2">
              {d.membre.ecole} <Drapeau pays={d.membre.pays} className="h-3.5 w-auto" /> · promo {d.membre.promo}
            </dd>
            <dt className="text-olive">Membre depuis</dt>
            <dd>{depuis(d.membre.arrivee).replace(/^il y a /, '')}</dd>
          </>
        )}
        <dt className="text-olive">Email</dt>
        <dd className="break-all">{d.requester_email}</dd>
        <dt className="text-olive">Sa raison</dt>
        <dd className={d.reason ? 'leading-relaxed' : 'text-olive'}>{d.reason ? `«${N}${d.reason}${N}»` : 'Aucune raison donnée.'}</dd>
      </dl>
      {d.status === 'pending' ? (
        <Decision d={d} e={e} />
      ) : (
        <p className="text-base text-olive">
          {issue(d)} {depuis(d.processed_at!)}.{d.status === 'approved' && ' Le nom et l’email restent ici comme trace.'}
        </p>
      )}
    </div>
  )
}

export default function PropositionA() {
  const e = useSuppressions()
  const [filtre, setFiltre] = useState<Filtre>('pending')
  const [choisie, setChoisie] = useState<string | null>(null)
  const liste = e.demandes.filter((d) => filtre === 'all' || d.status === filtre || d.id === choisie)
  const active = liste.find((d) => d.id === choisie) ?? liste[0]
  const attente = e.compte('pending')

  return (
    <>
      <EnteteMaquette attente={attente} />
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-4 sm:px-8 sm:pt-8">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
          <div>
            <h1 className="font-titre text-[clamp(2rem,3.4vw,2.8rem)] font-bold leading-[1.05] tracking-[-0.03em] text-vert">Demandes de suppression</h1>
            <p className="mt-3 text-lg text-olive">{attente > 0 ? `${attente} en attente de votre réponse` : 'Aucune demande en attente'}</p>
          </div>
          <div className="w-full sm:w-auto">
            <Filtres
              valeur={filtre}
              onChange={(f) => {
                setFiltre(f)
                setChoisie(null)
              }}
              options={optionsFiltre(e)}
            />
          </div>
        </div>

        {liste.length === 0 ? (
          <p className="mt-8 rounded-3xl bg-white p-8 text-center text-base text-olive">Aucune demande ici.</p>
        ) : (
          <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
            <ul className="grid grid-cols-[minmax(0,1fr)] content-start gap-2">
              {liste.map((d) => {
                const deplie = d.id === choisie
                const ici = d.id === active?.id
                return (
                  <li
                    key={d.id}
                    className={`rounded-2xl transition-colors ${deplie ? 'max-lg:bg-white max-lg:ring-2 max-lg:ring-vert' : 'max-lg:bg-white/60'} ${
                      ici ? 'lg:bg-white lg:ring-2 lg:ring-vert' : 'lg:bg-white/60 lg:hover:bg-white'
                    }`}
                  >
                    <button
                      type="button"
                      aria-expanded={deplie}
                      onClick={() => setChoisie(grandEcran() ? d.id : deplie ? null : d.id)}
                      className="flex w-full items-center gap-3 px-5 py-4 text-left"
                    >
                      <span className="grid min-w-0 flex-1 gap-0.5">
                        <span className="flex items-baseline justify-between gap-3">
                          <span className="font-semibold text-vert">{d.requester_name}</span>
                          <span className="shrink-0 text-sm text-olive">{depuis(d.created_at)}</span>
                        </span>
                        <span className="truncate text-sm text-olive">
                          {d.membre ? `${d.membre.ecole} · ${d.membre.promo}` : 'Compte supprimé'}
                          {d.status === 'rejected' && ' · compte gardé'}
                          {d.membre?.role === 'admin' && <span className="text-terre"> · administrateur</span>}
                        </span>
                      </span>
                      <ChevronDown className={`size-5 shrink-0 text-vert transition-transform duration-200 lg:hidden ${deplie ? 'rotate-180' : ''}`} aria-hidden="true" />
                    </button>
                    {deplie && (
                      <div className="px-5 pb-5 pt-1 lg:hidden">
                        <Detail d={d} e={e} entete={false} />
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
            <section aria-label="La demande choisie" className="hidden self-start rounded-3xl bg-white p-8 lg:sticky lg:top-6 lg:block">
              {active && <Detail key={active.id} d={active} e={e} />}
            </section>
          </div>
        )}
      </main>
    </>
  )
}
