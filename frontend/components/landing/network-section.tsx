import { PHOTOS } from '@/lib/landing'
import { BogolanPanel } from './bogolan'
import { PhotoFrame } from './photo-frame'

// Ce que l'annuaire permet, concrètement
const USES = [
  {
    title: 'Votre promo au complet',
    text: 'Les anciens de votre école et de votre année d’entrée, réunis au même endroit.',
  },
  {
    title: 'Un ancien dans chaque ville',
    text: 'Cherchez par nom, école, promo, pays ou ville : pour un conseil, une introduction, un premier contact.',
  },
  {
    title: 'Entre anciens seulement',
    text: 'Chaque membre a été invité par un ancien de sa promo, ou accueilli par un administrateur.',
  },
]

type Facts = { count: number; countries: number; oldest: { year: number; city: string } | null }

export function NetworkSection({ facts }: { facts: Facts }) {
  const stats = [
    facts.count > 0 && { value: String(facts.count), label: 'écoles militaires préparatoires' },
    facts.countries > 0 && { value: String(facts.countries), label: 'pays d’Afrique de l’Ouest et centrale' },
    facts.oldest && { value: String(facts.oldest.year), label: `création de la plus ancienne, à ${facts.oldest.city}` },
  ].filter(Boolean) as Array<{ value: string; label: string }>

  return (
    <section id="reseau" aria-labelledby="reseau-titre" className="sur-creme scroll-mt-6 bg-white px-5 py-20 text-encre sm:px-8 lg:py-28">
      <div className="mx-auto max-w-[1280px]">
        <h2 id="reseau-titre" className="mx-auto max-w-[18ch] text-center text-[clamp(2rem,3.8vw,3.25rem)] font-bold leading-[1.05] tracking-[-0.012em] text-vert text-balance [font-stretch:90%]">
          Une promo, c’est pour la vie
        </h2>

        <div className="mt-14 grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Collage : la photo de groupe en large, l'entraide dessous, un panneau de motifs à côté */}
          <div className="grid grid-cols-[1.4fr_1fr] gap-3 sm:gap-4">
            <PhotoFrame photo={PHOTOS.promo} position="50% 45%" sizes="(min-width: 1024px) 600px, 92vw" className="col-span-2 aspect-[2/1] rounded-3xl" />
            <PhotoFrame photo={PHOTOS.secours} position="45% 40%" sizes="(min-width: 1024px) 340px, 55vw" className="aspect-[4/3] rounded-3xl rounded-bl-[72px]" />
            <div className="overflow-hidden rounded-3xl rounded-tr-[72px] bg-vert">
              <BogolanPanel className="text-or/70" />
            </div>
          </div>

          <div>
            <p className="max-w-[48ch] text-lg leading-relaxed text-olive text-pretty">
              L’internat, la discipline, les camarades : ce qui lie les Anciens Enfants de Troupe ne s’arrête pas à la
              sortie de l’école. AET Connect les réunit, d’une école et d’un pays à l’autre.
            </p>
            <ul className="mt-8 border-t-2 border-sable">
              {USES.map((u) => (
                <li key={u.title} className="grid gap-1 border-b-2 border-sable py-4 sm:grid-cols-[13rem_1fr] sm:gap-6">
                  <span className="text-lg font-bold leading-snug text-vert [font-stretch:90%]">{u.title}</span>
                  <span className="text-base leading-relaxed text-olive">{u.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Les chiffres, tous tirés de la base */}
        {stats.length > 0 && (
          <ul className="mt-20 grid gap-8 border-t-2 border-sable pt-10 sm:grid-cols-3 sm:gap-0">
            {stats.map((s, i) => (
              <li key={s.label} className={`grid sm:px-8 ${i > 0 ? 'sm:border-l-2 sm:border-sable' : 'sm:pl-0'}`}>
                <span className="text-[2.75rem] font-bold leading-none tracking-[-0.02em] text-vert tabular-nums [font-stretch:90%]">{s.value}</span>
                <span className="mt-1 text-base text-olive">{s.label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
