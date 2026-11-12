'use client'

// Proposition A · « Les cartes » : chaque demande est une carte blanche où tout se lit (email, message, souhait
// d'ambassadeur) ; « Accepter » ouvre une fenêtre crème où l'on décide du statut d'ambassadeur, puis qui montre
// le message à transmettre. « Refuser » demande confirmation.
import { useEffect, useRef, useState } from 'react'
import { Drapeau } from '@/components/landing/drapeau'
import {
  ChoixAmbassadeur, EnteteMaquette, de, Filtres, MessageATransmettre, N, boutonAlerte, boutonVert, depuis, lienAlerte, nom, titre2, useDemandes,
  type Demande, type Filtre, type Resultat,
} from '../commun'

function Fenetre({ ouverte, onClose, titre, children }: { ouverte: boolean; onClose: () => void; titre: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    if (ouverte && !ref.current?.open) ref.current?.showModal()
    if (!ouverte && ref.current?.open) ref.current?.close()
  }, [ouverte])
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="fenetre-titre"
      className="sur-creme m-auto w-[min(34rem,calc(100vw-2rem))] rounded-3xl rounded-tr-[56px] bg-creme p-6 text-encre backdrop:bg-encre/50 sm:p-8"
    >
      <h2 id="fenetre-titre" className={titre2}>
        {titre}
      </h2>
      {children}
    </dialog>
  )
}

export default function PropositionA() {
  const { demandes, accepter, refuser } = useDemandes()
  const [filtre, setFiltre] = useState<Filtre>('pending')
  const [aAccepter, setAAccepter] = useState<Demande | null>(null)
  const [ambassadeur, setAmbassadeur] = useState(false)
  const [resultat, setResultat] = useState<Resultat | null>(null)
  const [aRefuser, setARefuser] = useState<Demande | null>(null)

  const attente = demandes.filter((d) => d.status === 'pending').length
  const liste = demandes.filter((d) => filtre === 'all' || d.status === filtre)

  const ouvrirAcceptation = (d: Demande) => {
    setAAccepter(d)
    setAmbassadeur(d.wants_ambassador && !d.promo_ambassador)
    setResultat(null)
  }

  return (
    <>
      <EnteteMaquette attente={attente} />
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-4 sm:px-8 sm:pt-8">
        <h1 className="font-titre text-[clamp(2rem,3.4vw,2.8rem)] font-bold leading-[1.05] tracking-[-0.03em] text-vert">Demandes d’accès</h1>
        <p className="mt-3 max-w-[60ch] text-lg leading-relaxed text-olive">
          {attente > 0
            ? `${attente} ${attente > 1 ? 'personnes attendent' : 'personne attend'} votre réponse. Accepter crée un code pour sa promo, avec le message à lui transmettre.`
            : 'Aucune demande n’attend de réponse.'}
        </p>

        <div className="mt-8">
          <Filtres valeur={filtre} onChange={setFiltre} demandes={demandes} />
        </div>

        {liste.length === 0 ? (
          <p className="mt-6 rounded-3xl bg-white p-8 text-center text-base text-olive">Aucune demande ici.</p>
        ) : (
          <ul className="mt-6 grid gap-4 lg:grid-cols-2">
            {liste.map((d) => (
              <li key={d.id} className="flex flex-col rounded-3xl bg-white p-5 sm:p-7">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <p className="font-titre text-xl font-semibold tracking-[-0.02em] text-vert">{nom(d)}</p>
                  <p className="text-sm text-olive">
                    {d.status === 'pending' ? depuis(d.created_at) : `${d.status === 'approved' ? 'Acceptée' : 'Refusée'} ${depuis(d.processed_at!)}`}
                  </p>
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 text-base text-encre">
                  {d.ecole} <Drapeau pays={d.pays} className="h-3.5 w-auto" /> · promo {d.entry_year}
                </p>
                <p className="mt-0.5 break-all text-base text-olive">{d.email}</p>
                {d.message && <p className="mt-4 text-base leading-relaxed text-encre">«{N}{d.message}{N}»</p>}
                {d.wants_ambassador && (
                  <p className="mt-4 text-sm text-terre">
                    Veut représenter sa promo
                    {d.promo_ambassador && <span className="text-olive"> · {nom(d.promo_ambassador)} la représente déjà</span>}
                  </p>
                )}
                {d.status === 'pending' && (
                  <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-2 pt-6">
                    <button type="button" className={boutonVert} onClick={() => ouvrirAcceptation(d)}>
                      Accepter
                    </button>
                    <button type="button" className={lienAlerte} onClick={() => setARefuser(d)}>
                      Refuser
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>

      <Fenetre
        ouverte={!!aAccepter}
        onClose={() => setAAccepter(null)}
        titre={aAccepter ? (resultat ? `Le code ${de(aAccepter.first_name)}` : `Accepter la demande ${de(nom(aAccepter))}${N}?`) : ''}
      >
        {aAccepter && !resultat && (
          <>
            <p className="mt-3 text-base leading-relaxed text-olive">
              Un code valable 30 jours est créé pour sa promo ({aAccepter.ecole}, {aAccepter.entry_year}), avec le message à lui transmettre.
            </p>
            <div className="mt-5 rounded-2xl bg-white px-4 py-2">
              <ChoixAmbassadeur d={aAccepter} actif={ambassadeur} onChange={setAmbassadeur} />
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
              <button type="button" className={boutonVert} onClick={() => setResultat(accepter(aAccepter.id, ambassadeur))}>
                Accepter la demande
              </button>
              <button type="button" className="inline-flex min-h-11 items-center text-base text-encre hover:text-terre" onClick={() => setAAccepter(null)}>
                Annuler
              </button>
            </div>
          </>
        )}
        {aAccepter && resultat && (
          <div className="mt-3">
            <MessageATransmettre d={aAccepter} r={resultat} fond="blanc" />
            <button type="button" className="mt-2 inline-flex min-h-11 items-center text-base text-encre hover:text-terre" onClick={() => setAAccepter(null)}>
              Fermer
            </button>
          </div>
        )}
      </Fenetre>

      <Fenetre ouverte={!!aRefuser} onClose={() => setARefuser(null)} titre={aRefuser ? `Refuser la demande ${de(nom(aRefuser))}${N}?` : ''}>
        <p className="mt-3 text-base leading-relaxed text-olive">
          La demande passe dans les refusées. Aucun message ne lui est envoyé ; elle pourra en faire une nouvelle.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
          <button
            type="button"
            className={boutonAlerte}
            onClick={() => {
              refuser(aRefuser!.id)
              setARefuser(null)
            }}
          >
            Refuser la demande
          </button>
          <button type="button" className="inline-flex min-h-11 items-center text-base text-encre hover:text-terre" onClick={() => setARefuser(null)}>
            Annuler
          </button>
        </div>
      </Fenetre>
    </>
  )
}
