'use client'

// Proposition C · « Votre école d'abord » : le bandeau vert est celui de votre école (son histoire, ses AET, vos
// collègues de promo) ; dessous, les huit autres écoles du réseau en liste compacte.
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Drapeau } from '@/components/landing/drapeau'
import { PhotoFrame } from '@/components/landing/photo-frame'
import { PHOTOS } from '@/lib/landing'
import { AUTRES, EnteteMaquette, MON_ECOLE, MOI, boutonCreme, fmt, lienAnnuaire, titre2 } from '../commun'

export default function PropositionC() {
  const e = MON_ECOLE
  return (
    <>
      <EnteteMaquette />
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-4 sm:px-8 sm:pt-8">
        <section className="sur-vert trame trame-sur-vert grid overflow-hidden rounded-3xl rounded-tr-[56px] bg-vert text-creme lg:grid-cols-[1.15fr_1fr] lg:rounded-tr-[76px]">
          <div className="flex flex-col justify-center gap-5 px-6 py-10 sm:px-10 lg:px-12 lg:py-12">
            <p className="flex items-center gap-2 text-base text-or">
              Votre école · <Drapeau pays={e.country} className="h-3.5 w-auto" /> {e.city}, {e.country}
            </p>
            <h1 className="font-titre text-[clamp(2rem,3.4vw,2.8rem)] font-bold leading-[1.05] tracking-[-0.03em]">{e.name_fr}</h1>
            <p className="max-w-[52ch] text-lg leading-relaxed text-brume">{e.description}</p>
            <dl className="flex flex-wrap gap-x-10 gap-y-4">
              {[
                [String(e.established_year), 'fondation'],
                [fmt(e.total_members), 'AET dans l’annuaire'],
                [String(e.total_ambassadors), 'ambassadeurs de promo'],
              ].map(([chiffre, texte]) => (
                <div key={texte}>
                  <dt className="sr-only">{texte}</dt>
                  <dd className="font-titre text-[2.2rem] font-semibold leading-none tabular-nums tracking-[-0.03em] text-or">{chiffre}</dd>
                  <dd className="mt-1 text-base text-brume">{texte}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-1 flex flex-wrap items-center gap-x-7 gap-y-2">
              <Link href={lienAnnuaire(e)} className={boutonCreme}>
                Voir les AET de {e.acronym}
              </Link>
              <Link href="#" className="group inline-flex min-h-11 items-center gap-1.5 text-base text-creme transition-colors hover:text-or">
                Ma promo {MOI.promo}
                <ArrowRight className="size-[18px] transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
          {/* Le texte donne la hauteur du bandeau ; la photo remplit la place qui reste */}
          <div className="relative lg:m-3">
            <div className="lg:absolute lg:inset-0">
              <PhotoFrame photo={PHOTOS.defile} sizes="(min-width: 1024px) 45vw, 100vw" className="aspect-[1600/1066] lg:aspect-auto lg:h-full lg:rounded-[1.25rem] lg:rounded-tr-[64px]" />
            </div>
          </div>
        </section>

        <section aria-labelledby="reseau" className="mt-14">
          <h2 id="reseau" className={titre2}>
            Les autres écoles du réseau
          </h2>
          <ul className="mt-5 grid gap-3 lg:grid-cols-2">
            {AUTRES.map((x) => (
              <li key={x.id}>
                <Link href={lienAnnuaire(x)} className="group grid min-h-24 grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-3 rounded-3xl bg-white px-4 py-4 sm:grid-cols-[4.5rem_minmax(0,1fr)_auto] sm:gap-4 sm:px-5">
                  <span className="grid size-11 place-items-center rounded-xl rounded-tr-[20px] bg-creme sm:size-16 sm:rounded-2xl sm:rounded-tr-[28px]">
                    <Drapeau pays={x.country} className="h-4 w-auto sm:h-6" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-titre text-base font-semibold tracking-[-0.02em] text-vert group-hover:text-terre">
                      {x.acronym} · {x.city}
                    </span>
                    <span className="block truncate text-sm text-olive">{x.name_fr}</span>
                    <span className="block text-sm text-olive">
                      {x.country} · fondée en {x.established_year}
                    </span>
                  </span>
                  <span className="flex items-center gap-2 text-right text-base text-encre group-hover:text-terre">
                    <span>
                      <span className="font-titre text-lg font-semibold tabular-nums text-vert group-hover:text-terre">{fmt(x.total_members)}</span> AET
                    </span>
                    <ArrowRight className="size-[18px] transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  )
}
