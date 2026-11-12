'use client'

// Proposition B · « La frise » : l'histoire du réseau, de la plus ancienne école (1962) à la plus récente (2001).
// L'année en grand à gauche, l'école à droite ; la vôtre est posée sur un panneau blanc.
import { Drapeau } from '@/components/landing/drapeau'
import { LienFleche } from '@/components/landing/lien-fleche'
import { Soleil } from '@/components/landing/soleil'
import { ECOLES, EnteteMaquette, FAITS, MOI, fmt, lienAnnuaire } from '../commun'

export default function PropositionB() {
  return (
    <>
      <EnteteMaquette />
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-4 sm:px-8 sm:pt-8">
        <header className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <h1 className="font-titre text-[clamp(2rem,3.4vw,2.8rem)] font-bold leading-[1.05] tracking-[-0.03em] text-vert">
              De Bingerville à Libreville
            </h1>
            <p className="mt-3 max-w-[52ch] text-lg leading-relaxed text-olive">
              Neuf écoles fondées entre {FAITS.depuis} et 2001, dans {FAITS.pays} pays. Chacune a formé ses promos ; ensemble, elles forment les AET.
            </p>
          </div>
          <Soleil className="hidden size-24 lg:block" />
        </header>

        <ol className="mt-12 grid gap-2">
          {ECOLES.map((e) => {
            const mienne = e.id === MOI.school_id
            return (
              <li
                key={e.id}
                className={`grid gap-x-10 gap-y-3 rounded-3xl px-6 py-7 sm:grid-cols-[9rem_minmax(0,1fr)] sm:px-8 lg:grid-cols-[11rem_minmax(0,1fr)_14rem] ${
                  mienne ? 'bg-white' : ''
                }`}
              >
                <p className="font-titre text-[clamp(2.2rem,4vw,3.2rem)] font-bold leading-none tabular-nums tracking-[-0.04em] text-vert">{e.established_year}</p>
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-x-2 text-sm text-olive">
                    <Drapeau pays={e.country} className="h-3.5 w-auto" />
                    {e.city}, {e.country}
                    {mienne && <span className="text-terre">· Votre école</span>}
                  </p>
                  <h2 className="mt-2 font-titre text-lg font-semibold tracking-[-0.02em] text-vert">
                    {e.acronym} · {e.name_fr}
                  </h2>
                  <p className="mt-2 max-w-[62ch] text-base leading-relaxed text-olive">{e.description}</p>
                </div>
                <div className="flex items-center justify-between gap-4 sm:col-start-2 lg:col-start-3 lg:flex-col lg:items-end lg:justify-start">
                  <p className="text-base text-encre">
                    <span className="font-titre text-2xl font-semibold tabular-nums tracking-[-0.03em] text-vert">{fmt(e.total_members)}</span> AET
                  </p>
                  <LienFleche href={lienAnnuaire(e)} visible>
                    Voir ses AET
                  </LienFleche>
                </div>
              </li>
            )
          })}
        </ol>
      </main>
    </>
  )
}
