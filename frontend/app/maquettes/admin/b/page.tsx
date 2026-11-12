'use client'

// Proposition B · « Les chiffres » : quatre chiffres en tête (ceux qui attendent une réponse sont cerclés de
// brun-roux), puis un grand panneau vert : les membres par école et par rôle ; enfin la liste des demandes.
import { Drapeau } from '@/components/landing/drapeau'
import { LienFleche } from '@/components/landing/lien-fleche'
import { Barres, DEMANDES, EnteteMaquette, STATS, depuis, titre2 } from '../commun'

const chiffre = 'font-titre text-[2.5rem] font-semibold leading-none tabular-nums tracking-[-0.03em] text-vert'

export default function PropositionB() {
  const tuiles = [
    { n: STATS.totalUsers, texte: `membres, dont ${STATS.newUsers} cette semaine`, lien: 'Voir les membres', attend: false },
    { n: STATS.pendingRequests, texte: 'demandes d’accès en attente', lien: 'Répondre', attend: true },
    { n: STATS.pendingDeletions, texte: 'demande de suppression', lien: 'Répondre', attend: true },
    { n: STATS.usedCodes, texte: `codes utilisés sur ${STATS.totalCodes}`, lien: null, attend: false },
  ]
  return (
    <>
      <EnteteMaquette />
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-4 sm:px-8 sm:pt-8">
        <h1 className="font-titre text-[clamp(2rem,3.4vw,2.8rem)] font-bold leading-[1.05] tracking-[-0.03em] text-vert">Le réseau en chiffres</h1>

        <ul className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {tuiles.map((t) => (
            <li key={t.texte} className={`flex flex-col rounded-3xl bg-white p-5 sm:p-6 ${t.attend && t.n > 0 ? 'ring-2 ring-terre' : ''}`}>
              <p className={chiffre}>{t.n}</p>
              <p className="mt-2 text-base text-olive">{t.texte}</p>
              {t.lien && (
                <div className="mt-auto pt-3">
                  <LienFleche href="#" visible>
                    {t.lien}
                  </LienFleche>
                </div>
              )}
            </li>
          ))}
        </ul>

        <section aria-labelledby="repartition" className="sur-vert trame trame-sur-vert mt-10 grid gap-10 rounded-3xl rounded-tr-[56px] bg-vert px-6 py-10 text-creme sm:px-10 lg:grid-cols-[1.5fr_1fr] lg:rounded-tr-[76px] lg:px-12">
          <div>
            <h2 id="repartition" className="font-titre text-xl font-semibold tracking-[-0.02em]">
              Membres par école
            </h2>
            <div className="mt-5">
              <Barres surVert />
            </div>
          </div>
          <div>
            <h2 className="font-titre text-xl font-semibold tracking-[-0.02em]">Par rôle</h2>
            <dl className="mt-5 grid gap-5">
              {[
                [STATS.roles.alumni, 'membres'],
                [STATS.roles.moderator, 'modérateurs'],
                [STATS.roles.admin, 'administrateurs'],
              ].map(([n, texte]) => (
                <div key={texte} className="flex items-baseline gap-3">
                  <dd className="font-titre text-3xl font-semibold tabular-nums tracking-[-0.03em] text-or">{n}</dd>
                  <dt className="text-base text-brume">{texte}</dt>
                </div>
              ))}
            </dl>
            <p className="mt-6 text-base text-brume">
              {STATS.approvedRequests} demandes d’accès acceptées sur {STATS.totalRequests}.
            </p>
          </div>
        </section>

        <section aria-labelledby="demandes" className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <h2 id="demandes" className={titre2}>
              Demandes d’accès en attente
            </h2>
            <LienFleche href="#" visible>
              Toutes les demandes
            </LienFleche>
          </div>
          <ul className="mt-5 grid gap-2">
            {DEMANDES.map((d) => (
              <li key={d.id} className="grid gap-x-6 gap-y-1 rounded-2xl bg-white px-5 py-4 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] sm:items-center">
                <p className="text-base text-encre">
                  {d.first_name} {d.last_name}
                  {d.wants_ambassador && <span className="ml-2 text-sm text-terre">veut représenter sa promo</span>}
                </p>
                <p className="flex items-center gap-2 text-base text-olive">
                  {d.ecole} <Drapeau pays={d.pays} className="h-3.5 w-auto" /> · {d.entry_year} · {depuis(d.created_at)}
                </p>
                <LienFleche href="#">Répondre</LienFleche>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  )
}
