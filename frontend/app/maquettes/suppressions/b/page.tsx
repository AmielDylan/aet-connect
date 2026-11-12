'use client'

// Proposition B · « Les cartes » : les demandes en attente sont peu nombreuses ; chacune a sa carte blanche où tout se
// lit (le membre, sa raison en grand) et où l'on décide. Dessous, l'historique : ce qui a été décidé, et quand.
import { Decision, Drapeau, EnteteMaquette, N, depuis, issue, titre2, useSuppressions } from '../commun'

export default function PropositionB() {
  const e = useSuppressions()
  const enAttente = e.demandes.filter((d) => d.status === 'pending')
  const traitees = e.demandes.filter((d) => d.status !== 'pending').sort((a, b) => b.processed_at!.localeCompare(a.processed_at!))

  return (
    <>
      <EnteteMaquette attente={enAttente.length} />
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-4 sm:px-8 sm:pt-8">
        <h1 className="font-titre text-[clamp(2rem,3.4vw,2.8rem)] font-bold leading-[1.05] tracking-[-0.03em] text-vert">Demandes de suppression</h1>
        <p className="mt-3 max-w-[62ch] text-lg leading-relaxed text-olive">
          {enAttente.length > 0
            ? `${enAttente.length} ${enAttente.length > 1 ? 'membres demandent' : 'membre demande'} à quitter AET Connect. Supprimer le compte efface la fiche ; garder le compte classe la demande.`
            : 'Aucune demande en attente.'}
        </p>

        {enAttente.length > 0 && (
          <ul className="mt-8 grid gap-4 lg:grid-cols-2">
            {enAttente.map((d) => (
              <li key={d.id} className="flex flex-col rounded-3xl bg-white p-5 sm:p-7">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <p className="font-titre text-xl font-semibold tracking-[-0.02em] text-vert">{d.requester_name}</p>
                  <p className="text-sm text-olive">{depuis(d.created_at)}</p>
                </div>
                {d.membre && (
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 text-base text-encre">
                    {d.membre.ecole} <Drapeau pays={d.membre.pays} className="h-3.5 w-auto" /> · promo {d.membre.promo}
                    {d.membre.role === 'admin' && <span className="text-terre">· administrateur</span>}
                  </p>
                )}
                <p className="mt-0.5 break-all text-base text-olive">{d.requester_email}</p>
                <p className={`mt-4 text-lg leading-relaxed ${d.reason ? 'text-encre' : 'text-olive'}`}>
                  {d.reason ? `«${N}${d.reason}${N}»` : 'Aucune raison donnée.'}
                </p>
                <div className="mt-auto pt-6">
                  <Decision d={d} e={e} />
                </div>
              </li>
            ))}
          </ul>
        )}

        <section aria-labelledby="historique" className="mt-12">
          <h2 id="historique" className={titre2}>
            Historique
          </h2>
          {traitees.length === 0 ? (
            <p className="mt-5 text-base text-olive">Aucune demande traitée pour l’instant.</p>
          ) : (
            <ul className="mt-5 grid gap-2">
              {traitees.map((d) => (
                <li key={d.id} className="grid gap-x-6 gap-y-1 rounded-2xl bg-white/60 px-5 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto] sm:items-center">
                  <p className="text-base text-encre">
                    {d.requester_name} <span className="text-sm text-olive">· {d.requester_email}</span>
                  </p>
                  <p className="truncate text-sm text-olive">{d.reason ? `«${N}${d.reason}${N}»` : 'Sans raison'}</p>
                  <p className={`text-sm ${d.status === 'approved' ? 'text-alerte' : 'text-vert'}`}>
                    {issue(d)} {depuis(d.processed_at!)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  )
}
