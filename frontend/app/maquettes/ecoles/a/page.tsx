'use client'

// Proposition A · « Les cartes » : un bandeau vert (le titre, trois chiffres, la cérémonie au drapeau), puis les neuf
// écoles en cartes blanches de même importance ; la vôtre vient en premier.
import { Drapeau } from '@/components/landing/drapeau'
import { LienFleche } from '@/components/landing/lien-fleche'
import { PhotoFrame } from '@/components/landing/photo-frame'
import { PHOTOS } from '@/lib/landing'
import { AUTRES, EnteteMaquette, FAITS, MON_ECOLE, N, fmt, lienAnnuaire, type Ecole } from '../commun'

function Carte({ e, mienne = false }: { e: Ecole; mienne?: boolean }) {
  return (
    <li className={`flex flex-col rounded-3xl bg-white p-6 ${mienne ? 'ring-2 ring-terre' : ''}`}>
      <p className="flex items-center gap-2 text-sm text-olive">
        <Drapeau pays={e.country} className="h-3.5 w-auto" />
        {e.country}
        {mienne && <span className="text-terre">· Votre école</span>}
      </p>
      <h2 className="mt-4 font-titre text-3xl font-bold tracking-[-0.03em] text-vert">{e.acronym}</h2>
      <p className="mt-1 text-base leading-snug text-encre">{e.name_fr}</p>
      <p className="mt-1 text-sm text-olive">
        {e.city} · fondée en {e.established_year}
      </p>
      <p className="mt-4 line-clamp-3 text-base leading-relaxed text-olive">{e.description}</p>
      <div className="mt-auto flex flex-wrap items-end justify-between gap-x-4 pt-6">
        <p className="text-base text-encre">
          <span className="font-titre text-2xl font-semibold tabular-nums tracking-[-0.03em] text-vert">{fmt(e.total_members)}</span> AET
        </p>
        <LienFleche href={lienAnnuaire(e)} visible>
          Voir ses AET
        </LienFleche>
      </div>
    </li>
  )
}

export default function PropositionA() {
  return (
    <>
      <EnteteMaquette />
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-4 sm:px-8 sm:pt-8">
        <section className="sur-vert trame trame-sur-vert grid overflow-hidden rounded-3xl rounded-tr-[56px] bg-vert text-creme lg:grid-cols-[1.1fr_1fr] lg:rounded-tr-[76px]">
          <div className="flex flex-col justify-center gap-6 px-6 py-10 sm:px-10 lg:px-12 lg:py-12">
            <h1 className="font-titre text-[clamp(2rem,3.4vw,2.8rem)] font-bold leading-[1.05] tracking-[-0.03em]">
              Neuf écoles, une seule famille
            </h1>
            <p className="max-w-[44ch] text-lg leading-relaxed text-brume">
              Des prytanées et des écoles militaires de huit pays, où les AET ont appris la même discipline et la même entraide.
            </p>
            <dl className="flex flex-wrap gap-x-10 gap-y-4">
              {[
                [String(FAITS.ecoles), 'écoles'],
                [String(FAITS.pays), 'pays'],
                [String(FAITS.depuis), 'la plus ancienne'],
              ].map(([chiffre, texte]) => (
                <div key={texte}>
                  <dt className="sr-only">{texte}</dt>
                  <dd className="font-titre text-[2.5rem] font-semibold leading-none tabular-nums tracking-[-0.03em] text-or">{chiffre}</dd>
                  <dd className="mt-1 text-base text-brume">{texte}</dd>
                </div>
              ))}
            </dl>
          </div>
          {/* Le texte donne la hauteur du bandeau ; la photo remplit la place qui reste */}
          <div className="relative lg:m-3">
            <div className="lg:absolute lg:inset-0">
              <PhotoFrame photo={PHOTOS.ceremonie} sizes="(min-width: 1024px) 45vw, 100vw" className="aspect-[1600/966] lg:aspect-auto lg:h-full lg:rounded-[1.25rem] lg:rounded-tr-[64px]" />
            </div>
          </div>
        </section>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Carte e={MON_ECOLE} mienne />
          {AUTRES.map((e) => (
            <Carte key={e.id} e={e} />
          ))}
        </ul>
        <p className="mt-8 text-sm text-olive">
          Votre école n’est pas dans la liste{N}? L’équipe AET Connect peut l’ajouter : il suffit de le lui demander.
        </p>
      </main>
    </>
  )
}
