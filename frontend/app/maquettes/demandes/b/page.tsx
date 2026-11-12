'use client'

// Proposition B · « Le tri » : la liste des demandes à gauche, la demande choisie en détail à droite (comme une
// boîte de réception). On décide sur place, et le message à transmettre prend la place des boutons.
// Sur mobile, la demande s'ouvre dans la liste, sous son nom.
import { useState } from 'react'
import { Drapeau } from '@/components/landing/drapeau'
import {
  ChoixAmbassadeur, EnteteMaquette, Filtres, MessageATransmettre, N, boutonAlerte, boutonVert, depuis, lienAlerte, nom, useDemandes,
  type Demande, type Filtre, type Resultat,
} from '../commun'

function Detail({
  d,
  resultat,
  onAccepter,
  onRefuser,
}: {
  d: Demande
  resultat: Resultat | null
  onAccepter: (ambassadeur: boolean) => void
  onRefuser: () => void
}) {
  const [ambassadeur, setAmbassadeur] = useState(d.wants_ambassador && !d.promo_ambassador)
  const [confirmeRefus, setConfirmeRefus] = useState(false)
  return (
    <div>
      <p className="text-sm text-olive">Demande reçue {depuis(d.created_at)}</p>
      <h2 className="mt-1 font-titre text-2xl font-semibold tracking-[-0.02em] text-vert">{nom(d)}</h2>
      <dl className="mt-5 grid gap-x-6 text-base sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-y-3 [&>dt]:mt-3 [&>dt]:text-sm sm:[&>dt]:mt-0 sm:[&>dt]:text-base [&>dt:first-child]:mt-0">
        <dt className="text-olive">École</dt>
        <dd className="flex flex-wrap items-center gap-x-2 text-encre">
          {d.ecole_nom} <Drapeau pays={d.pays} className="h-3.5 w-auto" />
        </dd>
        <dt className="text-olive">Promo</dt>
        <dd className="text-encre">{d.entry_year}</dd>
        <dt className="text-olive">Email</dt>
        <dd className="break-all text-encre">{d.email}</dd>
        {d.message && (
          <>
            <dt className="text-olive">Son message</dt>
            <dd className="leading-relaxed text-encre">«{N}{d.message}{N}»</dd>
          </>
        )}
      </dl>

      {d.status === 'pending' && !resultat && (
        <>
          <div className="mt-6 rounded-2xl bg-creme px-4 py-2">
            <ChoixAmbassadeur d={d} actif={ambassadeur} onChange={setAmbassadeur} />
          </div>
          {confirmeRefus ? (
            <div className="mt-6 rounded-2xl bg-creme p-4">
              <p className="text-base text-encre">Refuser{N}? Aucun message ne lui est envoyé ; elle pourra faire une nouvelle demande.</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
                <button type="button" className={boutonAlerte} onClick={onRefuser}>
                  Refuser la demande
                </button>
                <button type="button" className="inline-flex min-h-11 items-center text-base text-encre hover:text-terre" onClick={() => setConfirmeRefus(false)}>
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
              <button type="button" className={boutonVert} onClick={() => onAccepter(ambassadeur)}>
                Accepter et créer le code
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
            <MessageATransmettre d={d} r={resultat} />
          </div>
        </div>
      )}
      {d.status !== 'pending' && !resultat && (
        <p className="mt-6 text-base text-olive">
          {d.status === 'approved' ? 'Acceptée' : 'Refusée'} {depuis(d.processed_at!)}.
        </p>
      )}
    </div>
  )
}

export default function PropositionB() {
  const { demandes, accepter, refuser } = useDemandes()
  const [filtre, setFiltre] = useState<Filtre>('pending')
  const [choisie, setChoisie] = useState<string | null>('d1')
  const [resultats, setResultats] = useState<Record<string, Resultat>>({})

  const attente = demandes.filter((d) => d.status === 'pending').length
  // Une demande tout juste traitée reste dans la liste, le temps de copier le message
  const liste = demandes.filter((d) => filtre === 'all' || d.status === filtre || resultats[d.id] || d.id === choisie)
  const active = liste.find((d) => d.id === choisie) ?? null

  const detail = (d: Demande) => (
    <Detail
      key={d.id}
      d={d}
      resultat={resultats[d.id] ?? null}
      onAccepter={(amb) => setResultats((r) => ({ ...r, [d.id]: accepter(d.id, amb) }))}
      onRefuser={() => {
        refuser(d.id)
        setChoisie(null)
      }}
    />
  )

  return (
    <>
      <EnteteMaquette attente={attente} />
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-4 sm:px-8 sm:pt-8">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
          <div>
            <h1 className="font-titre text-[clamp(2rem,3.4vw,2.8rem)] font-bold leading-[1.05] tracking-[-0.03em] text-vert">Demandes d’accès</h1>
            <p className="mt-3 text-lg text-olive">
              {attente > 0 ? `${attente} en attente de votre réponse` : 'Aucune demande en attente'}
            </p>
          </div>
          <Filtres
            valeur={filtre}
            onChange={(f) => {
              setFiltre(f)
              setChoisie(null)
            }}
            demandes={demandes}
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
          {liste.length === 0 ? (
            <p className="rounded-3xl bg-white p-8 text-center text-base text-olive lg:col-span-2">Aucune demande ici.</p>
          ) : (
            <ul className="grid content-start gap-2">
              {liste.map((d) => {
                const ouverte = d.id === choisie
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
                        <span className="font-semibold text-vert">{nom(d)}</span>
                        <span className="shrink-0 text-sm text-olive">{depuis(d.created_at)}</span>
                      </span>
                      <span className="flex flex-wrap items-center gap-x-2 text-sm text-olive">
                        {d.ecole} <Drapeau pays={d.pays} className="h-3 w-auto" /> · {d.entry_year}
                        {d.status !== 'pending' && <span>· {d.status === 'approved' ? 'acceptée' : 'refusée'}</span>}
                      </span>
                      {d.wants_ambassador && <span className="text-sm text-terre">Veut représenter sa promo</span>}
                    </button>
                    {ouverte && <div className="mt-2 rounded-3xl bg-white p-5 lg:hidden">{detail(d)}</div>}
                  </li>
                )
              })}
            </ul>
          )}

          {liste.length > 0 && (
            <section aria-label="La demande choisie" className="hidden self-start rounded-3xl bg-white p-8 lg:sticky lg:top-6 lg:block">
              {active ? detail(active) : <p className="text-base text-olive">Choisissez une demande dans la liste.</p>}
            </section>
          )}
        </div>
      </main>
    </>
  )
}
