'use client'

// Proposition A · « Les tickets » : chaque code est un ticket à partager ; ceux qui ont rejoint grâce à vous ensuite.
import { useState } from 'react'
import { Jauge, Portrait } from '@/components/espace/portrait'
import { CODES, EnteteMaquette, FormAdmin, Limite, Partage, QUOTA, Revoquer, bouton, date, type CodeMaquette } from '../commun'

const titre2 = 'font-titre text-xl font-semibold tracking-[-0.02em] text-vert'

/** Un ticket : encoches sur les côtés, le code en grand, la date, le partage */
function Ticket({ c, nouveau = false }: { c: CodeMaquette; nouveau?: boolean }) {
  return (
    <li
      className={`relative rounded-3xl p-6 sm:p-7 ${nouveau ? 'bg-vert text-creme sur-vert' : 'bg-white'}`}
      style={{
        WebkitMask: 'radial-gradient(circle 14px at 0 58%, #0000 98%, #000) left / 51% 100% no-repeat, radial-gradient(circle 14px at 100% 58%, #0000 98%, #000) right / 51% 100% no-repeat',
        mask: 'radial-gradient(circle 14px at 0 58%, #0000 98%, #000) left / 51% 100% no-repeat, radial-gradient(circle 14px at 100% 58%, #0000 98%, #000) right / 51% 100% no-repeat',
      }}
    >
      {nouveau && <p className="mb-2 text-sm text-or">Votre nouveau code est prêt</p>}
      <p className={`font-titre text-[clamp(1.4rem,3vw,1.9rem)] font-bold tracking-[0.04em] ${nouveau ? 'text-creme' : 'text-vert'}`}>{c.code}</p>
      <p className={`mt-1 text-base ${nouveau ? 'text-brume' : 'text-olive'}`}>Une inscription, valable jusqu’au {date(c.expires_at)}</p>
      <div className={`mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 ${nouveau ? '[&_a]:text-creme [&_button]:text-creme [&_a:hover]:text-or [&_button:hover]:text-or' : ''}`}>
        <Partage c={c} />
        {!nouveau && <Revoquer c={c} />}
      </div>
    </li>
  )
}

export default function PropositionA() {
  const [admin, setAdmin] = useState(false)
  const [cree, setCree] = useState(false)
  const enAttente = CODES.filter((c) => c.status === 'valid')
  const utilises = CODES.filter((c) => c.status === 'exhausted')
  const expires = CODES.filter((c) => c.status === 'expired' || c.status === 'revoked')
  const nouveau: CodeMaquette = { id: 'n', code: 'AET-Q7HD-3MWS', status: 'valid', created_at: '2026-11-11', expires_at: '2026-12-11' }

  return (
    <>
      <EnteteMaquette admin={admin} setAdmin={setAdmin} />
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-4 sm:px-8 sm:pt-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-end">
          <div>
            <h1 className="font-titre text-[clamp(2rem,3.6vw,3rem)] font-bold leading-[1.05] tracking-[-0.03em] text-vert">Vos invitations</h1>
            <p className="mt-4 max-w-[52ch] text-lg leading-relaxed text-olive">
              Chaque code permet à un collègue de votre promo de rejoindre AET Connect. Il sert une seule fois et reste valable 30 jours ; un code qui
              expire sans servir vous rend votre invitation.
            </p>
          </div>
          {!admin && (
            <div className="grid gap-3 rounded-3xl bg-sable/45 p-6">
              <p className="text-base text-encre">
                <span className="font-titre text-3xl font-bold text-vert">{QUOTA.remaining - (cree ? 1 : 0)}</span> invitation disponible sur {QUOTA.limit}
              </p>
              <Jauge used={QUOTA.used + (cree ? 1 : 0)} limit={QUOTA.limit} />
              {cree ? (
                <Limite />
              ) : (
                <button type="button" onClick={() => setCree(true)} className={`${bouton} mt-2`}>
                  Créer un code
                </button>
              )}
            </div>
          )}
        </div>

        {admin && (
          <section aria-labelledby="creer-a" className="mt-10 rounded-3xl bg-white p-6 sm:p-8">
            <h2 id="creer-a" className={titre2}>
              Créer un code
            </h2>
            <p className="mt-2 text-base text-olive">En tant qu’administrateur, vous pouvez créer des codes pour toute école et toute promo.</p>
            <div className="mt-6 max-w-2xl">
              <FormAdmin />
            </div>
            <button type="button" onClick={() => setCree(true)} className={`${bouton} mt-6`}>
              Créer le code
            </button>
          </section>
        )}

        <section aria-labelledby="attente-a" className="mt-12">
          <h2 id="attente-a" className={titre2}>
            En attente
          </h2>
          <ul className="mt-5 grid gap-4 md:grid-cols-2">
            {cree && <Ticket c={nouveau} nouveau />}
            {enAttente.map((c) => (
              <Ticket key={c.id} c={c} />
            ))}
          </ul>
        </section>

        <section aria-labelledby="rejoint-a" className="mt-14">
          <h2 id="rejoint-a" className={titre2}>
            Ils ont rejoint grâce à vous
          </h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {utilises.map((c) => (
              <li key={c.id} className="flex items-center gap-4 rounded-2xl bg-white p-4">
                <Portrait prenom={c.used_by!.first_name} nom={c.used_by!.last_name} className="size-12 rounded-full bg-sable text-base text-vert" />
                <span className="min-w-0">
                  <span className="block text-base text-encre">
                    {c.used_by!.first_name} {c.used_by!.last_name}
                  </span>
                  <span className="block text-sm text-olive">
                    A rejoint le {date(c.used_by!.used_at, { day: 'numeric', month: 'long', year: 'numeric' })} · {c.code}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        {expires.length > 0 && (
          <section aria-labelledby="expires-a" className="mt-14">
            <h2 id="expires-a" className="text-base font-semibold text-vert">
              Codes qui n’ont pas servi
            </h2>
            <ul className="mt-3 grid gap-1 text-base text-olive">
              {expires.map((c) => (
                <li key={c.id}>
                  <span className="tracking-[0.04em]">{c.code}</span> · expiré le {date(c.expires_at)}
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </>
  )
}
