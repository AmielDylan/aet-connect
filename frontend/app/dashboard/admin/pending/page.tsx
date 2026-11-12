'use client'

// Administration · demandes d'accès, proposition B « Le tri » : la liste à gauche, la demande choisie en détail à
// droite, comme une boîte de réception. On décide sur place ; le message à transmettre prend la place des boutons.
// Sur mobile, la demande s'ouvre dans la liste, sous son nom.
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAdminCheck } from '@/hooks/use-admin-check'
import { apiClient } from '@/lib/api'
import { Drapeau } from '@/components/landing/drapeau'
import {
  ChoixAmbassadeur, Filtres, MessageATransmettre, N, boutonAlerte, boutonVert, depuis, lienAlerte, lienSimple, nomComplet,
} from '@/components/espace/administration'
import type { AccessRequest } from '@/types'

type Filtre = AccessRequest['status'] | 'all'
type Resultat = { code: string; message: string; envoye: boolean; email: string }

const message = (e: unknown) => (e instanceof Error && e.message ? e.message : 'Une erreur est survenue. Réessayez.')

function Detail({
  d,
  resultat,
  onAccepte,
  onRefuse,
}: {
  d: AccessRequest
  resultat: Resultat | null
  onAccepte: (r: Resultat) => void
  onRefuse: () => void
}) {
  const queryClient = useQueryClient()
  const [ambassadeur, setAmbassadeur] = useState(d.wants_ambassador && !d.promo_ambassador)
  const [confirmeRefus, setConfirmeRefus] = useState(false)
  const rafraichir = () => {
    queryClient.invalidateQueries({ queryKey: ['access-requests'] })
    queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
  }

  const accepter = useMutation({
    mutationFn: () => apiClient.approveAccessRequest(d.id, { grants_ambassador: ambassadeur && !d.promo_ambassador }),
    onSuccess: (r) => {
      onAccepte({ code: r.code, message: r.delivery.text, envoye: r.delivery.sent, email: r.email })
      rafraichir()
    },
  })
  const refuser = useMutation({
    mutationFn: () => apiClient.rejectAccessRequest(d.id),
    onSuccess: () => {
      onRefuse()
      rafraichir()
    },
  })
  const erreur = accepter.error ?? refuser.error
  const ecole = d.schools?.name_fr

  return (
    <div>
      <p className="text-sm text-olive">Demande reçue {depuis(d.created_at)}</p>
      <h2 className="mt-1 font-titre text-2xl font-semibold tracking-[-0.02em] text-vert">{nomComplet(d)}</h2>
      <dl className="mt-5 grid gap-x-6 text-base sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-y-3 [&>dt:first-child]:mt-0 [&>dt]:mt-3 [&>dt]:text-sm sm:[&>dt]:mt-0 sm:[&>dt]:text-base">
        {ecole && (
          <>
            <dt className="text-olive">École</dt>
            <dd className="flex flex-wrap items-center gap-x-2 text-encre">
              {ecole} {d.schools?.country && <Drapeau pays={d.schools.country} className="h-3.5 w-auto" />}
            </dd>
          </>
        )}
        <dt className="text-olive">Promo</dt>
        <dd className="text-encre">{d.entry_year}</dd>
        <dt className="text-olive">Email</dt>
        <dd className="break-all text-encre">{d.email}</dd>
        {d.message && (
          <>
            <dt className="text-olive">Son message</dt>
            <dd className="whitespace-pre-line leading-relaxed text-encre">
              «{N}
              {d.message}
              {N}»
            </dd>
          </>
        )}
      </dl>

      {d.status === 'pending' && !resultat && (
        <>
          <div className="mt-6">
            <ChoixAmbassadeur
              annee={d.entry_year}
              souhaite={d.wants_ambassador}
              actuel={d.promo_ambassador}
              actif={ambassadeur}
              onChange={setAmbassadeur}
            />
          </div>
          {erreur && (
            <p role="alert" className="mt-4 text-base font-semibold text-alerte">
              {message(erreur)}
            </p>
          )}
          {confirmeRefus ? (
            <div className="mt-6 rounded-2xl bg-creme p-4">
              <p className="text-base text-encre">
                Refuser la demande{N}? Aucun message n’est envoyé ; la personne pourra en faire une nouvelle.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
                <button type="button" className={boutonAlerte} disabled={refuser.isPending} onClick={() => refuser.mutate()}>
                  {refuser.isPending ? 'Refus…' : 'Refuser la demande'}
                </button>
                <button type="button" className={lienSimple} onClick={() => setConfirmeRefus(false)}>
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
              <button type="button" className={boutonVert} disabled={accepter.isPending} onClick={() => accepter.mutate()}>
                {accepter.isPending ? 'Création du code…' : 'Accepter et créer le code'}
              </button>
              <button type="button" className={lienAlerte} onClick={() => setConfirmeRefus(true)}>
                Refuser
              </button>
            </div>
          )}
        </>
      )}

      {resultat && (
        <div className="mt-6">
          <p className="font-titre text-lg font-semibold tracking-[-0.02em] text-vert">Demande acceptée</p>
          <div className="mt-2">
            <MessageATransmettre prenom={d.first_name} email={resultat.email} code={resultat.code} message={resultat.message} envoye={resultat.envoye} />
          </div>
        </div>
      )}
      {d.status !== 'pending' && !resultat && (
        <p className="mt-6 text-base text-olive">
          {d.status === 'approved' ? 'Acceptée' : 'Refusée'} {d.processed_at ? depuis(d.processed_at) : ''}.
        </p>
      )}
    </div>
  )
}

export default function DemandesAcces() {
  const { isAdmin } = useAdminCheck()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['access-requests', 'all'],
    queryFn: () => apiClient.getAccessRequests('all'),
    enabled: isAdmin,
  })
  const [filtre, setFiltre] = useState<Filtre>('pending')
  // undefined : la première de la liste ; null : aucune (on a refermé)
  const [choisie, setChoisie] = useState<string | null | undefined>(undefined)
  const [resultats, setResultats] = useState<Record<string, Resultat>>({})

  if (!isAdmin) return null

  const demandes = data ?? []
  const compte = (s: AccessRequest['status']) => demandes.filter((d) => d.status === s).length
  const attente = compte('pending')
  // Une demande tout juste acceptée reste dans la liste, le temps de copier le message
  const liste = demandes.filter((d) => filtre === 'all' || d.status === filtre || resultats[d.id] || d.id === choisie)
  const active = choisie === undefined ? liste[0] : liste.find((d) => d.id === choisie)

  const detail = (d: AccessRequest) => (
    <Detail
      key={d.id}
      d={d}
      resultat={resultats[d.id] ?? null}
      onAccepte={(r) => {
        setResultats((x) => ({ ...x, [d.id]: r }))
        setChoisie(d.id)
      }}
      onRefuse={() => setChoisie(undefined)}
    />
  )

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
        <div>
          <h1 className="font-titre text-[clamp(2rem,3.4vw,2.8rem)] font-bold leading-[1.05] tracking-[-0.03em] text-vert">Demandes d’accès</h1>
          <p className="mt-3 text-lg text-olive">
            {isLoading ? ' ' : attente > 0 ? `${attente} en attente de votre réponse` : 'Aucune demande en attente'}
          </p>
        </div>
        <Filtres
          valeur={filtre}
          onChange={(f) => {
            setFiltre(f)
            setChoisie(undefined)
          }}
          options={[
            { valeur: 'pending', texte: 'En attente', n: attente },
            { valeur: 'approved', texte: 'Acceptées', n: compte('approved') },
            { valeur: 'rejected', texte: 'Refusées', n: compte('rejected') },
            { valeur: 'all', texte: 'Toutes', n: demandes.length },
          ]}
        />
      </div>

      {isLoading ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]" aria-hidden="true">
          <ul className="grid content-start gap-2">
            {Array.from({ length: 4 }, (_, i) => (
              <li key={i} className="h-20 animate-pulse rounded-2xl bg-sable/50" />
            ))}
          </ul>
          <div className="hidden h-96 animate-pulse rounded-3xl bg-sable/50 lg:block" />
        </div>
      ) : isError ? (
        <div className="mt-8 rounded-3xl bg-white p-8 text-center">
          <p className="text-base text-olive">Les demandes n’ont pas pu être chargées.</p>
          <button type="button" onClick={() => refetch()} className={`${boutonVert} mt-4`}>
            Réessayer
          </button>
        </div>
      ) : liste.length === 0 ? (
        <p className="mt-8 rounded-3xl bg-white p-8 text-center text-base text-olive">
          {filtre === 'pending' ? 'Aucune demande n’attend de réponse.' : 'Aucune demande ici.'}
        </p>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
          <ul className="grid content-start gap-2">
            {liste.map((d) => {
              const ouverte = d.id === active?.id
              return (
                <li key={d.id}>
                  <button
                    type="button"
                    aria-expanded={ouverte}
                    onClick={() => setChoisie(ouverte ? null : d.id)}
                    className={`grid w-full gap-0.5 rounded-2xl px-5 py-4 text-left transition-colors ${
                      ouverte ? 'bg-white ring-2 ring-vert' : 'bg-white/60 hover:bg-white'
                    }`}
                  >
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="font-semibold text-vert">{nomComplet(d)}</span>
                      <span className="shrink-0 text-sm text-olive">{depuis(d.created_at)}</span>
                    </span>
                    <span className="flex flex-wrap items-center gap-x-2 text-sm text-olive">
                      {d.schools && (
                        <>
                          {d.schools.acronym || d.schools.name_fr} <Drapeau pays={d.schools.country} className="h-3 w-auto" /> ·
                        </>
                      )}{' '}
                      {d.entry_year}
                      {d.status !== 'pending' && <span>· {d.status === 'approved' ? 'acceptée' : 'refusée'}</span>}
                    </span>
                    {d.wants_ambassador && <span className="text-sm text-terre">Veut représenter sa promo</span>}
                  </button>
                  {ouverte && <div className="mt-2 rounded-3xl bg-white p-5 lg:hidden">{detail(d)}</div>}
                </li>
              )
            })}
          </ul>

          <section aria-label="La demande choisie" className="hidden self-start rounded-3xl bg-white p-8 lg:sticky lg:top-6 lg:block">
            {active ? detail(active) : <p className="text-base text-olive">Choisissez une demande dans la liste.</p>}
          </section>
        </div>
      )}
    </div>
  )
}
