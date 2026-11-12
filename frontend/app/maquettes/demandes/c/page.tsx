'use client'

// Proposition C · « Une à une » : le bandeau vert présente une seule demande à la fois, en grand (la plus ancienne
// d'abord : elle attend depuis le plus longtemps). On accepte, on refuse ou on passe ; le message à transmettre
// remplace la demande dans le bandeau. Dessous, la file d'attente et les demandes déjà traitées.
import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Drapeau } from '@/components/landing/drapeau'
import {
  ChoixAmbassadeur, EnteteMaquette, de, MessageATransmettre, N, boutonCreme, depuis, nom, titre2, useDemandes, type Demande, type Resultat,
} from '../commun'

const lienCreme = 'inline-flex min-h-11 items-center gap-1.5 text-base text-creme transition-colors hover:text-or'

function Courante({ d, rang, total, onAccepter, onRefuser, onPasser }: {
  d: Demande; rang: number; total: number; onAccepter: (amb: boolean) => void; onRefuser: () => void; onPasser: () => void
}) {
  const [ambassadeur, setAmbassadeur] = useState(d.wants_ambassador && !d.promo_ambassador)
  const [confirmeRefus, setConfirmeRefus] = useState(false)
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <div>
        <p className="text-base text-or">
          Demande {rang} sur {total} · reçue {depuis(d.created_at)}
        </p>
        <h1 className="mt-3 font-titre text-[clamp(2rem,3.4vw,2.8rem)] font-bold leading-[1.05] tracking-[-0.03em]">{nom(d)}</h1>
        <p className="mt-4 flex flex-wrap items-center gap-x-2 text-lg text-creme">
          {d.ecole_nom} <Drapeau pays={d.pays} className="h-4 w-auto" /> · promo {d.entry_year}
        </p>
        <p className="mt-1 break-all text-base text-brume">{d.email}</p>
        {d.message && <p className="mt-6 max-w-[48ch] text-xl leading-relaxed text-creme">«{N}{d.message}{N}»</p>}
      </div>
      <div className="self-end">
        <ChoixAmbassadeur d={d} actif={ambassadeur} onChange={setAmbassadeur} surVert />
        {confirmeRefus ? (
          <div className="mt-6">
            <p className="text-base text-creme">Refuser{N}? Aucun message ne lui est envoyé.</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
              <button type="button" className="inline-flex min-h-12 items-center rounded-full bg-alerte px-7 text-base font-semibold text-white hover:bg-alerte/90" onClick={onRefuser}>
                Refuser la demande
              </button>
              <button type="button" className={lienCreme} onClick={() => setConfirmeRefus(false)}>
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
            <button type="button" className={boutonCreme} onClick={() => onAccepter(ambassadeur)}>
              Accepter
            </button>
            <button type="button" className={lienCreme} onClick={() => setConfirmeRefus(true)}>
              Refuser
            </button>
            {total > 1 && (
              <button type="button" className={`${lienCreme} ml-auto`} onClick={onPasser}>
                Passer <ArrowRight className="size-[18px]" aria-hidden="true" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function PropositionC() {
  const { demandes, accepter, refuser } = useDemandes()
  const [decalage, setDecalage] = useState(0)
  const [fait, setFait] = useState<{ d: Demande; r: Resultat } | null>(null)

  // La plus ancienne d'abord
  const file = demandes.filter((d) => d.status === 'pending').sort((a, b) => a.created_at.localeCompare(b.created_at))
  const rang = file.length ? decalage % file.length : 0
  const courante = file[rang]
  const traitees = demandes.filter((d) => d.status !== 'pending').sort((a, b) => b.processed_at!.localeCompare(a.processed_at!))

  return (
    <>
      <EnteteMaquette attente={file.length} />
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-4 sm:px-8 sm:pt-8">
        <section className="sur-vert trame trame-sur-vert rounded-3xl rounded-tr-[56px] bg-vert px-6 py-10 text-creme sm:px-10 lg:rounded-tr-[76px] lg:px-12 lg:py-12">
          {fait ? (
            <div className="max-w-2xl">
              <p className="text-base text-or">Demande acceptée</p>
              <h1 className="mt-3 font-titre text-[clamp(1.8rem,3vw,2.4rem)] font-bold leading-[1.05] tracking-[-0.03em]">Le code {de(fait.d.first_name)}</h1>
              <div className="mt-5">
                <MessageATransmettre d={fait.d} r={fait.r} surVert />
              </div>
              <button type="button" className={`${lienCreme} mt-4`} onClick={() => setFait(null)}>
                {file.length ? 'Demande suivante' : 'Terminer'} <ArrowRight className="size-[18px]" aria-hidden="true" />
              </button>
            </div>
          ) : courante ? (
            <Courante
              key={courante.id}
              d={courante}
              rang={rang + 1}
              total={file.length}
              onAccepter={(amb) => setFait({ d: courante, r: accepter(courante.id, amb) })}
              onRefuser={() => refuser(courante.id)}
              onPasser={() => setDecalage((x) => x + 1)}
            />
          ) : (
            <div>
              <h1 className="font-titre text-[clamp(2rem,3.4vw,2.8rem)] font-bold leading-[1.05] tracking-[-0.03em]">Tout est à jour</h1>
              <p className="mt-3 text-lg text-brume">Aucune demande n’attend de réponse.</p>
            </div>
          )}
        </section>

        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          <section aria-labelledby="file">
            <h2 id="file" className={titre2}>
              Ensuite
            </h2>
            {file.length > 1 ? (
              <ol className="mt-5 grid gap-2">
                {file.map((d, i) =>
                  i === rang ? null : (
                    <li key={d.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setFait(null)
                          setDecalage(i)
                        }}
                        className="grid w-full gap-0.5 rounded-2xl bg-white px-5 py-4 text-left hover:text-terre"
                      >
                        <span className="flex items-baseline justify-between gap-3">
                          <span className="font-semibold text-vert">{nom(d)}</span>
                          <span className="shrink-0 text-sm text-olive">{depuis(d.created_at)}</span>
                        </span>
                        <span className="text-sm text-olive">
                          {d.ecole} · {d.entry_year}
                          {d.wants_ambassador && <span className="text-terre"> · veut représenter sa promo</span>}
                        </span>
                      </button>
                    </li>
                  ),
                )}
              </ol>
            ) : (
              <p className="mt-5 text-base text-olive">Personne d’autre n’attend.</p>
            )}
          </section>

          <section aria-labelledby="traitees">
            <h2 id="traitees" className={titre2}>
              Déjà traitées
            </h2>
            <ul className="mt-5 grid gap-2">
              {traitees.map((d) => (
                <li key={d.id} className="flex flex-wrap items-baseline justify-between gap-x-4 rounded-2xl bg-white/60 px-5 py-3">
                  <span className="text-base text-encre">
                    {nom(d)} <span className="text-sm text-olive">· {d.ecole} {d.entry_year}</span>
                  </span>
                  <span className={`text-sm ${d.status === 'approved' ? 'text-vert' : 'text-alerte'}`}>
                    {d.status === 'approved' ? 'Acceptée' : 'Refusée'} {depuis(d.processed_at!)}
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
