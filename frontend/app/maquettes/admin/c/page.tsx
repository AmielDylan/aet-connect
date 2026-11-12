'use client'

// Proposition C · « Le point du jour » : pas de bandeau, une phrase qui résume la situation ; puis une seule liste
// « À traiter » (demandes d'accès et de suppression mêlées, par date), et les sections de l'administration.
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Drapeau } from '@/components/landing/drapeau'
import { LienFleche } from '@/components/landing/lien-fleche'
import { Barres, DEMANDES, EnteteMaquette, MOI, STATS, SUPPRESSIONS, depuis, titre2 } from '../commun'

type Element = { id: string; type: 'acces' | 'suppression'; nom: string; detail: React.ReactNode; date: string }

export default function PropositionC() {
  const liste: Element[] = [
    ...DEMANDES.map((d) => ({
      id: d.id,
      type: 'acces' as const,
      nom: `${d.first_name} ${d.last_name}`,
      detail: (
        <>
          {d.ecole} <Drapeau pays={d.pays} className="h-3.5 w-auto" /> · promo {d.entry_year}
          {d.wants_ambassador && <span className="text-terre">· veut représenter sa promo</span>}
        </>
      ),
      date: d.created_at,
    })),
    ...SUPPRESSIONS.map((s) => ({ id: s.id, type: 'suppression' as const, nom: s.name, detail: <>«{' '}{s.reason}{' '}»</>, date: s.created_at })),
  ].sort((a, b) => b.date.localeCompare(a.date))

  const sections = [
    { titre: 'Demandes d’accès', n: STATS.pendingRequests, texte: 'en attente' },
    { titre: 'Membres', n: STATS.totalUsers, texte: 'dans le réseau' },
    { titre: 'Écoles', n: STATS.ecoles.length, texte: 'référencées' },
    { titre: 'Suppressions', n: STATS.pendingDeletions, texte: 'en attente' },
  ]

  return (
    <>
      <EnteteMaquette />
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-4 sm:px-8 sm:pt-8">
        <h1 className="font-titre text-[clamp(2rem,3.4vw,2.8rem)] font-bold leading-[1.05] tracking-[-0.03em] text-vert">Bonjour {MOI.first_name}</h1>
        <p className="mt-4 max-w-[58ch] text-xl leading-relaxed text-encre">
          Le réseau compte <strong className="font-semibold text-vert">{STATS.totalUsers} membres</strong>, dont {STATS.newUsers} arrivés cette semaine.{' '}
          <strong className="font-semibold text-terre">
            {STATS.pendingRequests} demandes d’accès et {STATS.pendingDeletions} demande de suppression
          </strong>{' '}
          attendent votre réponse.
        </p>

        <div className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <section aria-labelledby="traiter">
            <h2 id="traiter" className={titre2}>
              À traiter
            </h2>
            <ul className="mt-5 grid gap-2">
              {liste.map((e) => (
                <li key={e.id}>
                  <Link href="#" className="group grid gap-1 rounded-3xl bg-white px-5 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6 sm:px-6">
                    <span className="min-w-0">
                      <span className={`block text-sm ${e.type === 'suppression' ? 'text-alerte' : 'text-olive'}`}>
                        {e.type === 'acces' ? 'Demande d’accès' : 'Demande de suppression'} · {depuis(e.date)}
                      </span>
                      <span className="mt-0.5 block font-titre text-lg font-semibold tracking-[-0.02em] text-vert group-hover:text-terre">{e.nom}</span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-base text-olive">{e.detail}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-base text-encre group-hover:text-terre">
                      Répondre <ArrowRight className="size-[18px] transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <div className="grid content-start gap-10">
            <section aria-labelledby="sections">
              <h2 id="sections" className={titre2}>
                L’administration
              </h2>
              <ul className="mt-5 grid grid-cols-2 gap-3">
                {sections.map((s) => (
                  <li key={s.titre}>
                    <Link href="#" className="group block rounded-3xl bg-white p-5">
                      <span className="block font-titre text-3xl font-semibold tabular-nums tracking-[-0.03em] text-vert">{s.n}</span>
                      <span className="mt-1 block text-sm text-olive">{s.texte}</span>
                      <span className="mt-3 inline-flex items-center gap-1.5 text-base text-encre group-hover:text-terre">
                        {s.titre}
                        <ArrowRight className="size-[18px]" aria-hidden="true" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
            <section aria-labelledby="ecoles" className="rounded-3xl bg-white p-6 sm:p-8">
              <div className="flex flex-wrap items-end justify-between gap-x-6">
                <h2 id="ecoles" className={titre2}>
                  Membres par école
                </h2>
                <LienFleche href="#" visible>
                  Écoles
                </LienFleche>
              </div>
              <div className="mt-5">
                <Barres />
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  )
}
