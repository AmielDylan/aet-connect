'use client'

// « Les écoles » · proposition A « Les cartes » : un bandeau vert (le titre, trois chiffres tirés de la base, la
// cérémonie au drapeau), puis les écoles en cartes blanches de même importance, la vôtre en premier. Sur mobile,
// les cartes se resserrent : sans la description, l'essentiel tient en quelques lignes.
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/hooks/use-auth'
import { PHOTOS, realSchools, schoolFacts } from '@/lib/landing'
import { Drapeau } from '@/components/landing/drapeau'
import { LienFleche } from '@/components/landing/lien-fleche'
import { PhotoFrame } from '@/components/landing/photo-frame'
import type { SchoolWithStats } from '@/types'

const EN_LETTRES = ['Zéro', 'Une', 'Deux', 'Trois', 'Quatre', 'Cinq', 'Six', 'Sept', 'Huit', 'Neuf', 'Dix', 'Onze', 'Douze']
const membres = (n: number) => `${n.toLocaleString('fr-FR')} ${n > 1 ? 'membres' : 'membre'}`

function Carte({ e, mienne = false }: { e: SchoolWithStats; mienne?: boolean }) {
  return (
    <li className={`flex flex-col rounded-3xl bg-white p-4 sm:p-6 ${mienne ? 'ring-2 ring-terre' : ''}`}>
      {/* Sur mobile, pays, ville et année tiennent sur cette seule ligne */}
      <p className="flex flex-wrap items-center gap-x-2 text-sm text-olive">
        <Drapeau pays={e.country} className="h-3.5 w-auto" />
        {e.country}
        <span className="sm:hidden">
          · {e.city}
          {e.established_year && ` · ${e.established_year}`}
        </span>
        {mienne && <span className="text-terre">· Votre école</span>}
      </p>
      <h2 className="mt-1.5 font-titre text-2xl font-bold tracking-[-0.03em] text-vert sm:mt-4 sm:text-3xl">{e.acronym || e.name_fr}</h2>
      <p className="mt-0.5 text-base leading-snug text-encre sm:mt-1">{e.name_fr}</p>
      <p className="mt-1 hidden text-sm text-olive sm:block">
        {e.city}
        {e.established_year && ` · fondée en ${e.established_year}`}
      </p>
      {e.description && <p className="mt-4 hidden text-base leading-relaxed text-olive sm:line-clamp-3">{e.description}</p>}
      <div className="mt-auto flex flex-wrap items-end justify-between gap-x-4 pt-2 sm:pt-6">
        <p className="text-base text-encre">
          <span className="font-titre text-xl font-semibold tabular-nums tracking-[-0.03em] text-vert sm:text-2xl">
            {(e.total_members ?? 0).toLocaleString('fr-FR')}
          </span>{' '}
          {(e.total_members ?? 0) > 1 ? 'membres' : 'membre'}
        </p>
        <LienFleche href={`/dashboard/directory?school=${e.id}`} visible>
          Voir<span className="sr-only"> les {membres(e.total_members ?? 0)} de {e.acronym || e.name_fr}</span>
        </LienFleche>
      </div>
    </li>
  )
}

export default function Ecoles() {
  const { user } = useAuth()
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['schools'], queryFn: () => apiClient.getSchools() })

  const ecoles = realSchools(data?.schools ?? []) as SchoolWithStats[]
  const faits = schoolFacts(data?.schools ?? [])
  const mienne = ecoles.find((e) => e.id === user?.school_id)
  const autres = ecoles.filter((e) => e !== mienne)

  return (
    <div>
      <section className="sur-vert trame trame-sur-vert grid overflow-hidden rounded-3xl rounded-tr-[56px] bg-vert text-creme lg:grid-cols-[1.1fr_1fr] lg:rounded-tr-[76px]">
        <div className="flex flex-col justify-center gap-6 px-6 py-10 sm:px-10 lg:px-12 lg:py-12">
          <h1 className="font-titre text-[clamp(2rem,3.4vw,2.8rem)] font-bold leading-[1.05] tracking-[-0.03em] text-balance">
            {faits.count ? `${EN_LETTRES[faits.count] ?? faits.count} écoles, une seule famille` : 'Les écoles du réseau'}
          </h1>
          <p className="max-w-[44ch] text-lg leading-relaxed text-brume">
            {`Des prytanées et des écoles militaires${faits.countries > 1 ? ` de ${faits.countries} pays` : ''}, où chacun a appris la même discipline et la même entraide.`}
          </p>
          {faits.count > 0 && (
            <dl className="flex flex-wrap gap-x-10 gap-y-4">
              {[
                [String(faits.count), faits.count > 1 ? 'écoles' : 'école'],
                [String(faits.countries), 'pays'],
                ...(faits.oldest ? [[String(faits.oldest.year), 'la plus ancienne']] : []),
              ].map(([chiffre, texte]) => (
                <div key={texte} className="flex flex-col-reverse">
                  <dt className="mt-1 text-base text-brume">{texte}</dt>
                  <dd className="font-titre text-[2.5rem] font-semibold leading-none tabular-nums tracking-[-0.03em] text-or">{chiffre}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
        {/* Le texte donne la hauteur du bandeau ; la photo remplit la place qui reste */}
        <div className="relative m-3 mt-0 lg:mt-3">
          <div className="lg:absolute lg:inset-0">
            <PhotoFrame
              photo={PHOTOS.ceremonie}
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="aspect-[1600/966] rounded-[1.25rem] lg:aspect-auto lg:h-full lg:rounded-tr-[64px]"
            />
          </div>
        </div>
      </section>

      {isLoading ? (
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i} className="h-44 animate-pulse rounded-3xl bg-sable/50 sm:h-80" />
          ))}
        </ul>
      ) : isError ? (
        <div className="mt-12 rounded-3xl bg-white p-8 text-center">
          <p className="text-base text-olive">Les écoles n’ont pas pu être chargées.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 inline-flex min-h-12 items-center rounded-full bg-vert px-7 text-base font-semibold text-creme transition-colors hover:bg-vert-carte"
          >
            Réessayer
          </button>
        </div>
      ) : (
        <ul className="mt-12 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {mienne && <Carte e={mienne} mienne />}
          {autres.map((e) => (
            <Carte key={e.id} e={e} />
          ))}
        </ul>
      )}
    </div>
  )
}
