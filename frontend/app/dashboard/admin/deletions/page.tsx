'use client'

// Administration · demandes de suppression, proposition B « Les cartes » : les demandes en attente sont rares ;
// chacune a sa carte blanche où tout se lit (le membre, sa raison en grand) et où l'on décide : supprimer le compte
// ou le garder. Dessous, l'historique : ce qui a été décidé, et quand. Une demande traitée garde le nom et l'email.
import { useState } from 'react'
import Link from 'next/link'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAdminCheck } from '@/hooks/use-admin-check'
import { apiClient } from '@/lib/api'
import { Drapeau } from '@/components/landing/drapeau'
import { N, boutonAlerte, boutonVert, depuis, lienSimple } from '@/components/espace/administration'
import type { DeletionRequest } from '@/types'

const titre2 = 'font-titre text-xl font-semibold tracking-[-0.02em] text-vert'
const message = (e: unknown) => (e instanceof Error && e.message ? e.message : 'Une erreur est survenue. Réessayez.')
const nom = (d: DeletionRequest) => (d.users ? `${d.users.first_name} ${d.users.last_name}`.trim() : null) || d.requester_name || d.requester_email || 'Membre'
const email = (d: DeletionRequest) => d.users?.email ?? d.requester_email ?? ''
const issue = (d: DeletionRequest) => (d.status === 'approved' ? 'Compte supprimé' : 'Compte gardé')

/* ─────────── La décision ─────────── */

/**
 * « Supprimer le compte » (plein, en alerte, après confirmation) ou « Garder le compte » (après confirmation).
 * Le compte d'un administrateur ne se supprime pas ici : il faut d'abord lui retirer ses droits.
 */
function Decision({ d }: { d: DeletionRequest }) {
  const queryClient = useQueryClient()
  const [confirme, setConfirme] = useState<null | 'supprimer' | 'garder'>(null)
  const rafraichir = () => {
    queryClient.invalidateQueries({ queryKey: ['deletion-requests'] })
    queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    queryClient.invalidateQueries({ queryKey: ['admin-users'] })
  }
  const supprimer = useMutation({ mutationFn: () => apiClient.approveDeletionRequest(d.id), onSuccess: rafraichir })
  const garder = useMutation({ mutationFn: () => apiClient.rejectDeletionRequest(d.id), onSuccess: rafraichir })
  const erreur = supprimer.error ?? garder.error
  const enCours = supprimer.isPending || garder.isPending

  const alerte = erreur && (
    <p role="alert" className="text-base font-semibold text-alerte">
      {message(erreur)}
    </p>
  )

  if (d.users?.role === 'admin') {
    return (
      <div className="grid gap-2">
        <p className="text-base text-olive">C’est un compte administrateur : retirez-lui d’abord ses droits (page des membres) pour pouvoir le supprimer.</p>
        {alerte}
        <div className="flex flex-wrap items-center gap-x-6">
          <Link href="/dashboard/admin/users" className={lienSimple}>
            Ouvrir la page des membres
          </Link>
          <button type="button" className={lienSimple} disabled={enCours} onClick={() => garder.mutate()}>
            {garder.isPending ? 'Classement…' : 'Garder le compte'}
          </button>
        </div>
      </div>
    )
  }

  if (confirme) {
    const suppression = confirme === 'supprimer'
    return (
      <div className="grid gap-3 rounded-2xl bg-creme p-4">
        <p className="text-base text-encre">
          {suppression ? (
            <>
              Supprimer le compte de {nom(d)}
              {N}? Sa fiche disparaît de l’annuaire et ses codes encore valables sont révoqués. La demande reste dans l’historique. On ne peut pas revenir en
              arrière.
            </>
          ) : (
            <>
              Garder le compte{N}? La demande est classée et le compte reste actif. Aucun message ne part : pensez à prévenir {d.users?.first_name ?? nom(d)} (
              {email(d)}).
            </>
          )}
        </p>
        {alerte}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {suppression ? (
            <button type="button" className={boutonAlerte} disabled={enCours} onClick={() => supprimer.mutate()}>
              {supprimer.isPending ? 'Suppression…' : 'Supprimer le compte'}
            </button>
          ) : (
            <button type="button" className={boutonVert} disabled={enCours} onClick={() => garder.mutate()}>
              {garder.isPending ? 'Classement…' : 'Garder le compte'}
            </button>
          )}
          <button type="button" className={lienSimple} disabled={enCours} onClick={() => setConfirme(null)}>
            Annuler
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
      <button type="button" className={boutonAlerte} onClick={() => setConfirme('supprimer')}>
        Supprimer le compte
      </button>
      <button type="button" className={lienSimple} onClick={() => setConfirme('garder')}>
        Garder le compte
      </button>
    </div>
  )
}

/* ─────────── La page ─────────── */

export default function DemandesSuppression() {
  const { isAdmin } = useAdminCheck()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['deletion-requests', 'all'],
    queryFn: () => apiClient.getDeletionRequests('all'),
    enabled: isAdmin,
  })

  if (!isAdmin) return null

  const demandes = data ?? []
  const enAttente = demandes.filter((d) => d.status === 'pending')
  const traitees = demandes.filter((d) => d.status !== 'pending').sort((a, b) => (b.processed_at ?? b.created_at).localeCompare(a.processed_at ?? a.created_at))

  return (
    <div>
      <h1 className="font-titre text-[clamp(2rem,3.4vw,2.8rem)] font-bold leading-[1.05] tracking-[-0.03em] text-vert">Demandes de suppression</h1>
      <p className="mt-3 min-h-7 max-w-[62ch] text-lg leading-relaxed text-olive">
        {data &&
          (enAttente.length > 0
            ? `${enAttente.length} ${enAttente.length > 1 ? 'membres demandent' : 'membre demande'} à quitter AET Connect. Supprimer le compte efface la fiche ; garder le compte classe la demande.`
            : 'Aucune demande en attente.')}
      </p>

      {isLoading ? (
        <ul className="mt-8 grid gap-4 lg:grid-cols-2" aria-hidden="true">
          {Array.from({ length: 2 }, (_, i) => (
            <li key={i} className="h-64 animate-pulse rounded-3xl bg-sable/50" />
          ))}
        </ul>
      ) : isError ? (
        <div className="mt-8 rounded-3xl bg-white p-8 text-center">
          <p className="text-base text-olive">Les demandes n’ont pas pu être chargées.</p>
          <button type="button" onClick={() => refetch()} className={`${boutonVert} mt-4`}>
            Réessayer
          </button>
        </div>
      ) : (
        <>
          {enAttente.length > 0 && (
            <ul className="mt-8 grid gap-4 lg:grid-cols-2">
              {enAttente.map((d) => {
                const ecole = d.users?.schools
                return (
                  <li key={d.id} className="flex flex-col rounded-3xl bg-white p-5 sm:p-7">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                      <h2 className="font-titre text-xl font-semibold tracking-[-0.02em] text-vert">{nom(d)}</h2>
                      <p className="text-sm text-olive">{depuis(d.created_at)}</p>
                    </div>
                    {d.users && (
                      <p className="mt-1 flex flex-wrap items-center gap-x-2 text-base text-encre">
                        {ecole && (
                          <>
                            {ecole.acronym || ecole.name_fr} {ecole.country && <Drapeau pays={ecole.country} className="h-3.5 w-auto" />} ·
                          </>
                        )}{' '}
                        promo {d.users.entry_year}
                        {d.users.role === 'admin' && <span className="text-terre">· administrateur</span>}
                      </p>
                    )}
                    <p className="mt-0.5 break-all text-base text-olive">
                      {email(d)}
                      {d.users && ` · membre depuis ${depuis(d.users.created_at).replace(/^il y a /, '')}`}
                    </p>
                    <p className={`mt-4 whitespace-pre-line text-lg leading-relaxed ${d.reason ? 'text-encre' : 'text-olive'}`}>
                      {d.reason ? `«${N}${d.reason}${N}»` : 'Aucune raison donnée.'}
                    </p>
                    <div className="mt-auto pt-6">
                      <Decision d={d} />
                    </div>
                  </li>
                )
              })}
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
                  <li
                    key={d.id}
                    className="grid gap-x-6 gap-y-1 rounded-2xl bg-white/60 px-5 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto] sm:items-center"
                  >
                    <p className="min-w-0 text-base text-encre">
                      {nom(d)} <span className="break-all text-sm text-olive">· {email(d)}</span>
                    </p>
                    <p className="truncate text-sm text-olive">{d.reason ? `«${N}${d.reason}${N}»` : 'Sans raison'}</p>
                    <p className={`text-sm ${d.status === 'approved' ? 'text-alerte' : 'text-vert'}`}>
                      {issue(d)} {d.processed_at ? depuis(d.processed_at) : ''}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  )
}
