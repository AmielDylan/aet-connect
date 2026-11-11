'use client'

// Proposition A · « Le portrait » : une colonne centrée, le portrait en grand, puis ses mots, ses coordonnées,
// et la rangée de ses collègues de promo.
import { useState } from 'react'
import Link from 'next/link'
import { Drapeau } from '@/components/landing/drapeau'
import { LienFleche } from '@/components/landing/lien-fleche'
import { Portrait } from '@/components/espace/portrait'
import { COLLEGUES, COMPLET, Coordonnees, DISCRET, EnteteMaquette, Representant, TOTAL_PROMO, ecole, lien } from '../commun'

const titre2 = 'font-titre text-xl font-semibold tracking-[-0.02em] text-vert'

export default function PropositionA() {
  const [discret, setDiscret] = useState(false)
  const p = discret ? DISCRET : COMPLET
  return (
    <>
      <EnteteMaquette discret={discret} setDiscret={setDiscret} />
      <main className="mx-auto max-w-3xl px-5 pb-20 pt-4 sm:px-8 sm:pt-8">
        <LienFleche href="#">Retour à l’annuaire</LienFleche>

        <section className="mt-6 grid justify-items-center text-center">
          <Portrait prenom={p.first_name} nom={p.last_name} className="size-44 rounded-[2rem] rounded-tr-[64px] bg-sable text-5xl text-vert" />
          <p className="mt-6 rounded-full bg-vert px-3 py-1 text-sm text-creme">{lien(p)}</p>
          <h1 className="mt-4 font-titre text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.05] tracking-[-0.03em] text-vert">
            {p.first_name} {p.last_name}
          </h1>
          <p className="mt-3 flex flex-wrap items-center justify-center gap-x-2 text-lg text-olive">
            {ecole(p)} · promo {p.entry_year}
            {p.school && <Drapeau pays={p.school.country} className="h-3.5 w-auto" />}
          </p>
          {p.current_city && <p className="mt-1 text-base text-olive">Vit à {p.current_city}</p>}
          {p.is_ambassador && (
            <span className="mt-3">
              <Representant />
            </span>
          )}
        </section>

        {p.bio && (
          <section aria-labelledby="mots-a" className="mt-12">
            <h2 id="mots-a" className={titre2}>
              En quelques mots
            </h2>
            <p className="mt-3 text-lg leading-relaxed text-encre">{p.bio}</p>
          </section>
        )}

        <section aria-labelledby="contact-a" className="mt-10">
          <h2 id="contact-a" className={titre2}>
            Prendre contact
          </h2>
          <div className="mt-4">
            <Coordonnees p={p} tone="blanc" />
          </div>
        </section>

        <section aria-labelledby="promo-a" className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <h2 id="promo-a" className={titre2}>
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
      </main>
    </>
  )
}
