'use client'

// Proposition A · « La file » : ce qui attend une réponse passe d'abord. Le bandeau dit combien de demandes
// attendent et mène à elles ; dessous, les dernières demandes d'accès à gauche, le réseau en chiffres à droite.
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Drapeau } from '@/components/landing/drapeau'
import { LienFleche } from '@/components/landing/lien-fleche'
import { Barres, DEMANDES, EnteteMaquette, MOI, N, STATS, SUPPRESSIONS, boutonCreme, depuis, titre2 } from '../commun'

export default function PropositionA() {
  const enAttente = STATS.pendingRequests + STATS.pendingDeletions
  return (
    <>
      <EnteteMaquette />
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-4 sm:px-8 sm:pt-8">
        <section className="sur-vert trame trame-sur-vert grid gap-8 overflow-hidden rounded-3xl rounded-tr-[56px] bg-vert px-6 py-10 text-creme sm:px-10 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:rounded-tr-[76px] lg:px-12 lg:py-12">
          <div>
            <p className="text-base text-or">Bonjour {MOI.first_name}</p>
            <h1 className="mt-3 font-titre text-[clamp(2rem,3.4vw,2.8rem)] font-bold leading-[1.05] tracking-[-0.03em]">
              {enAttente} demandes attendent votre réponse
            </h1>
            <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-2">
              <Link href="#" className={boutonCreme}>
                Répondre aux demandes
              </Link>
              <Link href="#" className="group inline-flex min-h-11 items-center gap-1.5 text-base text-creme transition-colors hover:text-or">
                La demande de suppression
                <ArrowRight className="size-[18px] transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-6">
            {[
              [STATS.pendingRequests, 'demandes d’accès'],
              [STATS.pendingDeletions, 'demande de suppression'],
            ].map(([n, texte]) => (
              <div key={texte} className="flex flex-col-reverse">
                <dt className="mt-1 text-base text-brume">{texte}</dt>
                <dd className="font-titre text-[3.5rem] font-semibold leading-none tabular-nums tracking-[-0.04em] text-or">{n}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <section aria-labelledby="demandes">
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
              <h2 id="demandes" className={titre2}>
                Les dernières demandes d’accès
              </h2>
              <LienFleche href="#" visible>
                Toutes les demandes
              </LienFleche>
            </div>
            <ul className="mt-5 grid gap-3">
              {DEMANDES.map((d) => (
                <li key={d.id} className="rounded-3xl bg-white p-5 sm:p-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <p className="font-titre text-lg font-semibold tracking-[-0.02em] text-vert">
                      {d.first_name} {d.last_name}
                    </p>
                    <p className="text-sm text-olive">{depuis(d.created_at)}</p>
                  </div>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 text-base text-olive">
                    {d.ecole} <Drapeau pays={d.pays} className="h-3.5 w-auto" /> · promo {d.entry_year}
                    {d.wants_ambassador && <span className="text-terre">· Veut représenter sa promo</span>}
                  </p>
                  {d.message && <p className="mt-3 text-base leading-relaxed text-encre">«{N}{d.message}{N}»</p>}
                  <div className="mt-3">
                    <LienFleche href="#">Répondre</LienFleche>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-base text-olive">
              Demande de suppression : {SUPPRESSIONS[0].name}, {depuis(SUPPRESSIONS[0].created_at)}.
            </p>
          </section>

          <section aria-labelledby="reseau" className="self-start rounded-3xl bg-white p-6 sm:p-8">
            <h2 id="reseau" className={titre2}>
              Le réseau
            </h2>
            <dl className="mt-5 grid grid-cols-2 gap-6">
              <div className="flex flex-col-reverse">
                <dt className="mt-1 text-base text-olive">membres, dont {STATS.newUsers} cette semaine</dt>
                <dd className="font-titre text-[2.5rem] font-semibold leading-none tabular-nums tracking-[-0.03em] text-vert">{STATS.totalUsers}</dd>
              </div>
              <div className="flex flex-col-reverse">
                <dt className="mt-1 text-base text-olive">codes utilisés sur {STATS.totalCodes}</dt>
                <dd className="font-titre text-[2.5rem] font-semibold leading-none tabular-nums tracking-[-0.03em] text-vert">{STATS.usedCodes}</dd>
              </div>
            </dl>
            <h3 className="mt-8 text-sm font-semibold text-vert">Membres par école</h3>
            <div className="mt-3">
              <Barres />
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
