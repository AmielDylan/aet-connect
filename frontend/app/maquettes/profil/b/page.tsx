'use client'

// Proposition B · « Le bandeau » : dans la continuité de l'accueil, de « Mes codes » et de l'annuaire,
// le bandeau vert porte le portrait et l'identité ; dessous, ses mots et ses coordonnées, puis sa promo.
import { useState } from 'react'
import Link from 'next/link'
import { Mail } from 'lucide-react'
import { Drapeau } from '@/components/landing/drapeau'
import { LienFleche } from '@/components/landing/lien-fleche'
import { Portrait } from '@/components/espace/portrait'
import { COLLEGUES, COMPLET, Coordonnees, DISCRET, EnteteMaquette, TOTAL_PROMO, ecole, lien } from '../commun'

const titre2 = 'font-titre text-xl font-semibold tracking-[-0.02em] text-vert'

export default function PropositionB() {
  const [discret, setDiscret] = useState(false)
  const p = discret ? DISCRET : COMPLET
  return (
    <>
      <EnteteMaquette discret={discret} setDiscret={setDiscret} />
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-4 sm:px-8 sm:pt-8">
        <LienFleche href="#">Retour à l’annuaire</LienFleche>

        {/* Bandeau : coin haut droit 76px, le portrait dedans est concentrique */}
        <section className="sur-vert trame trame-sur-vert mt-4 grid overflow-hidden rounded-3xl rounded-tr-[56px] bg-vert text-creme md:grid-cols-[1fr_auto] md:rounded-tr-[76px]">
          <div className="flex flex-col justify-center gap-5 px-6 py-10 sm:px-10 lg:px-12 lg:py-12 md:order-1">
            <p className="text-base text-or">{lien(p)}</p>
            <h1 className="font-titre text-[clamp(2.1rem,4vw,3.2rem)] font-bold leading-[1.05] tracking-[-0.03em]">
              {p.first_name} {p.last_name}
            </h1>
            <div className="grid gap-1 text-lg text-brume">
              <p className="flex flex-wrap items-center gap-x-2">
                {ecole(p)} · promo {p.entry_year}
                {p.school && <Drapeau pays={p.school.country} className="h-3.5 w-auto" />}
              </p>
              {p.current_city && <p>Vit à {p.current_city}</p>}
            </div>
            {p.is_ambassador && <p className="text-base text-creme">Représente sa promo sur AET Connect</p>}
            {p.email && (
              <a
                href={`mailto:${p.email}`}
                className="mt-2 inline-flex min-h-12 items-center gap-2 self-start rounded-full bg-creme px-7 text-base font-semibold text-vert transition-colors hover:bg-white"
              >
                <Mail className="size-[18px]" aria-hidden="true" /> Lui écrire
              </a>
            )}
          </div>
          <div className="md:order-2 md:m-3">
            <Portrait
              prenom={p.first_name}
              nom={p.last_name}
              className="aspect-square w-full bg-sable text-7xl text-vert md:size-80 md:rounded-[1.25rem] md:rounded-tr-[64px]"
            />
          </div>
        </section>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
          <div className="grid content-start gap-10">
            {p.bio && (
              <section aria-labelledby="mots-b">
                <h2 id="mots-b" className={titre2}>
                  En quelques mots
                </h2>
                <p className="mt-3 max-w-[60ch] text-lg leading-relaxed text-encre">{p.bio}</p>
              </section>
            )}
            <section aria-labelledby="promo-b">
              <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
                <h2 id="promo-b" className={titre2}>
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
          <section aria-labelledby="contact-b" className="content-start rounded-3xl bg-white p-6 sm:p-8">
            <h2 id="contact-b" className={titre2}>
              Coordonnées
            </h2>
            <div className="mt-4">
              <Coordonnees p={p} />
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
