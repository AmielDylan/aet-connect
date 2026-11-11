import { PHOTOS } from '@/lib/landing'
import { PhotoFrame } from './photo-frame'
import { Soleil } from './soleil'

// Ce que l'annuaire permet, concrètement
const USES = [
  {
    title: 'Toute votre promo',
    text: 'Vos collègues de promotion, entrés dans la même école la même année que vous, réunis au même endroit.',
  },
  {
    title: 'Un AET dans chaque ville',
    text: 'Où que vous alliez, vous pouvez chercher un AET par nom, école, promo, pays ou ville : pour un conseil, une mise en relation ou un premier contact en arrivant.',
  },
  {
    title: 'Entre AET seulement',
    text: 'Chaque membre a été invité par un collègue de sa promotion ou validé par un administrateur : l’annuaire ne réunit que de vrais Anciens Enfants de Troupe.',
  },
]

type Facts = { count: number; countries: number; oldest: { year: number; city: string } | null }

export function NetworkSection({ facts }: { facts: Facts }) {
  const stats = [
    facts.count > 0 && { value: String(facts.count), label: 'écoles militaires préparatoires' },
    facts.countries > 0 && { value: String(facts.countries), label: 'pays d’Afrique de l’Ouest et centrale' },
    facts.oldest && { value: String(facts.oldest.year), label: `création de la plus ancienne école, à ${facts.oldest.city}` },
  ].filter(Boolean) as Array<{ value: string; label: string }>

  return (
    <section id="reseau" aria-labelledby="reseau-titre" className="sur-creme scroll-mt-6 bg-white px-5 py-20 text-encre sm:px-8 lg:py-28">
      <div className="mx-auto max-w-[1280px]">
        <h2 id="reseau-titre" className="mx-auto max-w-[18ch] text-center text-[clamp(1.75rem,3.1vw,2.6rem)] font-bold leading-[1.1] tracking-[-0.025em] text-vert text-balance font-titre">
          AET un jour, AET toujours
        </h2>

        <div className="mt-14 grid items-center gap-12 sm:mt-16 lg:mt-24 lg:grid-cols-2 lg:gap-20">
          {/* Collage : la photo de groupe en large, l'entraide dessous, un panneau de motifs à côté */}
          <div className="grid grid-cols-[1.4fr_1fr] gap-3 sm:gap-4">
            <PhotoFrame photo={PHOTOS.promo} position="50% 45%" sizes="(min-width: 1024px) 600px, 92vw" className="col-span-2 aspect-[2/1] rounded-3xl" />
            <PhotoFrame photo={PHOTOS.secours} position="45% 40%" sizes="(min-width: 1024px) 340px, 55vw" className="aspect-[4/3] rounded-3xl rounded-bl-[72px]" />
            <div aria-hidden="true" className="grid place-items-center overflow-hidden rounded-3xl rounded-tr-[72px] bg-vert">
              <Soleil className="w-[72%]" petales="fill-creme" coeur="fill-terre" />
            </div>
          </div>

          <div>
            <p className="max-w-[46ch] text-lg leading-relaxed text-olive text-pretty lg:text-xl lg:leading-[1.65]">
              L’internat, la discipline, les camarades : ce qui nous lie ne s’est pas arrêté à la
              sortie de l’école. AET Connect nous rassemble, par-delà les écoles et les frontières.
            </p>
            <ul className="mt-10 grid gap-8 lg:mt-12 lg:gap-10">
              {USES.map((u) => (
                <li key={u.title} className="grid gap-1.5 sm:grid-cols-[14rem_1fr] sm:gap-8">
                  <span className="text-lg font-semibold leading-snug tracking-[-0.02em] text-vert font-titre">{u.title}</span>
                  <span className="text-lg leading-relaxed text-olive">{u.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Les chiffres, tous tirés de la base */}
        {stats.length > 0 && (
          <ul className="mt-20 grid gap-8 sm:grid-cols-3 sm:gap-8 lg:mt-28">
            {stats.map((s) => (
              <li key={s.label} className="grid">
                <span className="text-[2.5rem] font-semibold leading-none tracking-[-0.03em] text-vert tabular-nums font-titre">{s.value}</span>
                <span className="mt-1 text-base text-olive">{s.label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
