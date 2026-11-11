'use client'

// Proposition C · « La fiche » : deux colonnes ; à gauche, une colonne fixe sur sable avec le portrait et les
// coordonnées ; à droite, ses mots, son parcours AET en registre, et sa promo.
import { useState } from 'react'
import Link from 'next/link'
import { Drapeau } from '@/components/landing/drapeau'
import { LienFleche } from '@/components/landing/lien-fleche'
import { Portrait } from '@/components/espace/portrait'
import { COLLEGUES, COMPLET, Coordonnees, DISCRET, EnteteMaquette, Representant, TOTAL_PROMO, lien } from '../commun'

const titre2 = 'font-titre text-xl font-semibold tracking-[-0.02em] text-vert'

export default function PropositionC() {
  const [discret, setDiscret] = useState(false)
  const p = discret ? DISCRET : COMPLET
  const parcours = [
    { t: 'École', v: p.school ? `${p.school.name_fr} (${p.school.acronym})` : '' },
    { t: 'Ville de l’école', v: p.ville_ecole, pays: p.school?.country },
    { t: 'Promo', v: p.entry_year ?? '' },
    { t: 'Vit aujourd’hui à', v: [p.current_city, p.current_country].filter(Boolean).join(', ') },
  ].filter((x) => x.v)
  return (
    <>
      <EnteteMaquette discret={discret} setDiscret={setDiscret} />
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-4 sm:px-8 sm:pt-8">
        <LienFleche href="#">Retour à l’annuaire</LienFleche>

        <div className="mt-6 grid gap-8 lg:grid-cols-[22rem_1fr] lg:items-start">
          <aside className="rounded-3xl rounded-tr-[64px] bg-sable/45 p-6 sm:p-7 lg:sticky lg:top-6">
            <Portrait prenom={p.first_name} nom={p.last_name} className="aspect-square w-full rounded-2xl rounded-tr-[48px] bg-sable text-6xl text-vert" />
            <p className="mt-5 text-sm text-terre">{lien(p)}</p>
            <h1 className="mt-1 font-titre text-[2rem] font-bold leading-[1.05] tracking-[-0.03em] text-vert">
              {p.first_name} {p.last_name}
            </h1>
            {p.is_ambassador && (
              <p className="mt-3">
                <Representant />
              </p>
            )}
            <div className="mt-6">
              <Coordonnees p={p} tone="blanc" />
            </div>
          </aside>

          <div className="grid content-start gap-10">
            {p.bio && (
              <section aria-labelledby="mots-c">
                <h2 id="mots-c" className={titre2}>
                  En quelques mots
                </h2>
                <p className="mt-3 max-w-[62ch] text-lg leading-relaxed text-encre">{p.bio}</p>
              </section>
            )}
            <section aria-labelledby="parcours-c">
              <h2 id="parcours-c" className={titre2}>
                Son parcours AET
              </h2>
              <dl className="mt-4 grid gap-2">
                {parcours.map((x) => (
                  <div key={x.t} className="grid gap-1 rounded-2xl bg-white px-5 py-4 sm:grid-cols-[12rem_1fr] sm:gap-6">
                    <dt className="text-sm text-olive">{x.t}</dt>
                    <dd className="flex items-center gap-2 text-base text-encre">
                      {x.v}
                      {x.pays && <Drapeau pays={x.pays} className="h-3.5 w-auto" />}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
            <section aria-labelledby="promo-c">
              <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
                <h2 id="promo-c" className={titre2}>
                  Sa promo
                </h2>
                <LienFleche href="#" visible>
                  Voir les {TOTAL_PROMO}
                </LienFleche>
              </div>
              <ul className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-6">
                {COLLEGUES.map((c) => (
                  <li key={c.id}>
                    <Link href="#" className="group block">
                      <Portrait
                        prenom={c.first_name}
                        nom={c.last_name}
                        className="aspect-square w-full rounded-2xl bg-sable text-lg text-vert transition-colors group-hover:bg-vert group-hover:text-creme"
                      />
                      <span className="mt-2 block text-sm text-encre group-hover:text-terre">{c.first_name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </main>
    </>
  )
}
