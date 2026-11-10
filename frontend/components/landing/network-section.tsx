import { ArrowRight } from 'lucide-react'
import { PHOTOS } from '@/lib/landing'
import { BogolanPanel, Glyph } from './bogolan'
import { PhotoFrame } from './photo-frame'

const PILLARS = [
  {
    title: 'Fraternité',
    text: 'Retrouvez vos camarades de promo et d’école, où qu’ils vivent aujourd’hui.',
  },
  {
    title: 'Entraide',
    text: 'Trouvez un ancien dans une ville, un pays ou un métier, pour un conseil ou une introduction.',
  },
  {
    title: 'Confiance',
    text: 'Chaque membre a été invité par un ancien de sa promo, ou accueilli par un administrateur.',
  },
]

type Facts = { count: number; countries: number; oldest: { year: number; city: string } | null }

export function NetworkSection({ facts }: { facts: Facts }) {
  const stats = [
    facts.count > 0 && { value: String(facts.count), label: 'écoles militaires préparatoires', glyph: 'echelle' as const },
    facts.countries > 0 && { value: String(facts.countries), label: 'pays d’Afrique de l’Ouest et centrale', glyph: 'losange' as const },
    facts.oldest && { value: String(facts.oldest.year), label: `la plus ancienne école, à ${facts.oldest.city}`, glyph: 'spirale' as const },
  ].filter(Boolean) as Array<{ value: string; label: string; glyph: 'echelle' | 'losange' | 'spirale' }>

  return (
    <section id="reseau" aria-labelledby="reseau-titre" className="sur-creme scroll-mt-6 bg-white px-5 py-20 text-encre sm:px-8 lg:py-28">
      <div className="mx-auto max-w-[1280px]">
        <h2 id="reseau-titre" className="mx-auto max-w-[18ch] text-center text-[clamp(2rem,3.8vw,3.25rem)] font-bold leading-[1.05] tracking-[-0.012em] text-vert text-balance [font-stretch:90%]">
          Une promo, c&apos;est pour la vie
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
            <p className="max-w-[52ch] text-lg leading-relaxed text-olive text-pretty">
              Les années d&apos;internat, la discipline, les camarades devenus frères : ce qui lie les Anciens
              Enfants de Troupe ne s&apos;arrête pas à la sortie de l&apos;école. AET Connect leur donne un lieu pour
              se retrouver, d&apos;une école à l&apos;autre et d&apos;un pays à l&apos;autre.
            </p>
            <ul className="mt-8 grid gap-0 border-t-2 border-sable">
              {PILLARS.map((p) => (
                <li key={p.title} className="grid gap-1 border-b-2 border-sable py-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
                  <span className="text-lg font-bold text-vert [font-stretch:90%]">{p.title}</span>
                  <span className="text-base leading-relaxed text-olive">{p.text}</span>
                </li>
              ))}
            </ul>
            <a
              href="#rejoindre"
              className="group mt-9 inline-flex min-h-12 items-center gap-2.5 rounded-full bg-vert px-6 text-base font-semibold text-or transition-colors duration-200 hover:bg-vert-carte"
            >
              Rejoindre ma promo
              <ArrowRight className="size-[18px] transition-transform duration-200 ease-out group-hover:translate-x-1" aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Les chiffres, tous tirés de la base */}
        {stats.length > 0 && (
          <ul className="mt-20 grid gap-8 border-t-2 border-sable pt-10 sm:grid-cols-3 sm:gap-0">
            {stats.map((s, i) => (
              <li key={s.label} className={`flex items-start gap-4 sm:px-8 ${i > 0 ? 'sm:border-l-2 sm:border-sable' : 'sm:pl-0'}`}>
                <Glyph name={s.glyph} className="mt-2 size-7 shrink-0 text-or" />
                <p className="grid">
                  <span className="text-[2.75rem] font-bold leading-none tracking-[-0.02em] text-vert tabular-nums [font-stretch:90%]">{s.value}</span>
                  <span className="mt-1 text-base text-olive">{s.label}</span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
