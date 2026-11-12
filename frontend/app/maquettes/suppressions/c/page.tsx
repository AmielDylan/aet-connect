'use client'

// Proposition C · « Une à une » : le bandeau vert présente une seule demande à la fois, la plus ancienne d'abord,
// avec la raison du membre en grand ; on décide dans le bandeau. Dessous, la suite et l'historique.
import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Decision, Drapeau, EnteteMaquette, N, depuis, issue, titre2, useSuppressions } from '../commun'

export default function PropositionC() {
  const e = useSuppressions()
  const [decalage, setDecalage] = useState(0)
  const file = e.demandes.filter((d) => d.status === 'pending').sort((a, b) => a.created_at.localeCompare(b.created_at))
  const rang = file.length ? decalage % file.length : 0
  const d = file[rang]
  const traitees = e.demandes.filter((x) => x.status !== 'pending').sort((a, b) => b.processed_at!.localeCompare(a.processed_at!))

  return (
    <>
      <EnteteMaquette attente={file.length} />
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-4 sm:px-8 sm:pt-8">
        <section className="sur-vert trame trame-sur-vert rounded-3xl rounded-tr-[56px] bg-vert px-6 py-10 text-creme sm:px-10 lg:rounded-tr-[76px] lg:px-12 lg:py-12">
          {d ? (
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
              <div>
                <p className="text-base text-or">
                  Demande de suppression {rang + 1} sur {file.length} · reçue {depuis(d.created_at)}
                </p>
                <h1 className="mt-3 font-titre text-[clamp(2rem,3.4vw,2.8rem)] font-bold leading-[1.05] tracking-[-0.03em]">{d.requester_name}</h1>
                {d.membre && (
                  <p className="mt-4 flex flex-wrap items-center gap-x-2 text-lg text-creme">
                    {d.membre.ecole} <Drapeau pays={d.membre.pays} className="h-4 w-auto" /> · promo {d.membre.promo}
                    {d.membre.role === 'admin' && <span className="text-or">· administrateur</span>}
                  </p>
                )}
                <p className="mt-1 break-all text-base text-brume">{d.requester_email}</p>
                <p className={`mt-6 max-w-[48ch] text-xl leading-relaxed ${d.reason ? 'text-creme' : 'text-brume'}`}>
                  {d.reason ? `«${N}${d.reason}${N}»` : 'Aucune raison donnée.'}
                </p>
              </div>
              <div className="grid content-end gap-4">
                <Decision key={d.id} d={d} e={e} surVert />
                {file.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setDecalage((x) => x + 1)}
                    className="inline-flex min-h-11 items-center gap-1.5 justify-self-start text-base text-creme hover:text-or"
                  >
                    Passer <ArrowRight className="size-[18px]" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div>
              <h1 className="font-titre text-[clamp(2rem,3.4vw,2.8rem)] font-bold leading-[1.05] tracking-[-0.03em]">Tout est à jour</h1>
              <p className="mt-3 text-lg text-brume">Aucune demande de suppression n’attend de réponse.</p>
            </div>
          )}
        </section>

        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          <section aria-labelledby="suite">
            <h2 id="suite" className={titre2}>
              Ensuite
            </h2>
            {file.length > 1 ? (
              <ol className="mt-5 grid gap-2">
                {file.map((x, i) =>
                  i === rang ? null : (
                    <li key={x.id}>
                      <button type="button" onClick={() => setDecalage(i)} className="grid w-full gap-0.5 rounded-2xl bg-white px-5 py-4 text-left hover:text-terre">
                        <span className="flex items-baseline justify-between gap-3">
                          <span className="font-semibold text-vert">{x.requester_name}</span>
                          <span className="shrink-0 text-sm text-olive">{depuis(x.created_at)}</span>
                        </span>
                        <span className="truncate text-sm text-olive">{x.reason ? `«${N}${x.reason}${N}»` : 'Sans raison'}</span>
                      </button>
                    </li>
                  ),
                )}
              </ol>
            ) : (
              <p className="mt-5 text-base text-olive">Personne d’autre n’attend.</p>
            )}
          </section>
          <section aria-labelledby="historique">
            <h2 id="historique" className={titre2}>
              Historique
            </h2>
            <ul className="mt-5 grid gap-2">
              {traitees.map((x) => (
                <li key={x.id} className="flex flex-wrap items-baseline justify-between gap-x-4 rounded-2xl bg-white/60 px-5 py-3">
                  <span className="text-base text-encre">{x.requester_name}</span>
                  <span className={`text-sm ${x.status === 'approved' ? 'text-alerte' : 'text-vert'}`}>
                    {issue(x)} {depuis(x.processed_at!)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </>
  )
}
