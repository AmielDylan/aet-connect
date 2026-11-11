'use client'

// Proposition C · « Le registre » : tous les codes dans une seule liste filtrable, et un panneau fixe pour inviter.
import { useState } from 'react'
import { Jauge, Portrait } from '@/components/espace/portrait'
import { CODES, EnteteMaquette, FormAdmin, Limite, Partage, QUOTA, Revoquer, bouton, etat, type CodeMaquette, type Statut } from '../commun'

const FILTRES: { label: string; statuts: Statut[] }[] = [
  { label: 'Tous', statuts: ['valid', 'exhausted', 'expired', 'revoked'] },
  { label: 'En attente', statuts: ['valid'] },
  { label: 'Utilisés', statuts: ['exhausted'] },
  { label: 'Sans suite', statuts: ['expired', 'revoked'] },
]

const PASTILLE: Record<Statut, string> = {
  valid: 'bg-vert text-creme',
  exhausted: 'bg-sable text-vert',
  expired: 'bg-creme text-olive',
  revoked: 'bg-creme text-olive',
}
const NOM: Record<Statut, string> = { valid: 'En attente', exhausted: 'Utilisé', expired: 'Expiré', revoked: 'Révoqué' }

export default function PropositionC() {
  const [admin, setAdmin] = useState(false)
  const [filtre, setFiltre] = useState(0)
  const [cree, setCree] = useState(false)
  const nouveau: CodeMaquette = { id: 'n', code: 'AET-Q7HD-3MWS', status: 'valid', created_at: '2026-11-11', expires_at: '2026-12-11' }
  const tous = [...(cree ? [nouveau] : []), ...CODES]
  const liste = tous.filter((c) => FILTRES[filtre].statuts.includes(c.status))

  return (
    <>
      <EnteteMaquette admin={admin} setAdmin={setAdmin} />
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-4 sm:px-8 sm:pt-8">
        <h1 className="font-titre text-[clamp(2rem,3.6vw,3rem)] font-bold leading-[1.05] tracking-[-0.03em] text-vert">Vos invitations</h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
          <section aria-label="Vos codes" className="order-2 lg:order-1">
            <div role="tablist" aria-label="Filtrer les codes" className="flex flex-wrap gap-2">
              {FILTRES.map((f, i) => {
                const n = tous.filter((c) => f.statuts.includes(c.status)).length
                return (
                  <button
                    key={f.label}
                    role="tab"
                    aria-selected={filtre === i}
                    onClick={() => setFiltre(i)}
                    className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-base transition-colors ${
                      filtre === i ? 'bg-vert text-creme' : 'bg-white text-encre hover:text-terre'
                    }`}
                  >
                    {f.label} <span className="tabular-nums opacity-80">{n}</span>
                  </button>
                )
              })}
            </div>
            <ul className="mt-5 grid gap-2">
              {liste.map((c) => (
                <li key={c.id} className={`grid gap-3 rounded-2xl bg-white p-4 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-5 sm:px-5 ${c.id === 'n' ? 'ring-2 ring-terre' : ''}`}>
                  {c.used_by ? (
                    <Portrait prenom={c.used_by.first_name} nom={c.used_by.last_name} className="hidden size-11 rounded-full bg-sable text-sm text-vert sm:grid" />
                  ) : (
                    <span className="hidden size-11 sm:block" />
                  )}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="font-titre text-lg font-bold tracking-[0.04em] text-vert">{c.code}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${PASTILLE[c.status]}`}>{NOM[c.status]}</span>
                    </div>
                    <p className="mt-0.5 text-sm text-olive">{etat(c)}</p>
                  </div>
                  {c.status === 'valid' && (
                    <div className="flex items-center gap-1">
                      <Partage c={c} compact />
                      <Revoquer c={c} />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <aside aria-labelledby="inviter-c" className="order-1 rounded-3xl rounded-tr-[56px] bg-sable/45 p-6 sm:p-7 lg:sticky lg:top-6 lg:order-2">
            <h2 id="inviter-c" className="font-titre text-xl font-semibold tracking-[-0.02em] text-vert">
              Inviter un collègue
            </h2>
            {admin ? (
              <div className="mt-4">
                <FormAdmin />
              </div>
            ) : (
              <>
                <p className="mt-3 text-base text-encre">
                  <span className="font-titre text-3xl font-bold text-vert">{QUOTA.remaining - (cree ? 1 : 0)}</span> invitation disponible sur {QUOTA.limit}
                </p>
                <div className="mt-3">
                  <Jauge used={QUOTA.used + (cree ? 1 : 0)} limit={QUOTA.limit} />
                </div>
                <div className="mt-4">
                  {cree ? (
                    <Limite />
                  ) : (
                    <p className="text-base leading-relaxed text-olive">
                      Un code sert une seule fois et reste valable 30 jours. S’il expire ou que vous le révoquez sans qu’il ait servi, l’invitation vous
                      revient.
                    </p>
                  )}
                </div>
              </>
            )}
            {(admin || !cree) && (
              <button type="button" onClick={() => setCree(true)} className={`${bouton} mt-6 w-full`}>
                Créer un code
              </button>
            )}
          </aside>
        </div>
      </main>
    </>
  )
}
