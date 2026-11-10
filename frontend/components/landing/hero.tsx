import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PHOTOS } from '@/lib/landing'
import { Glyph } from './bogolan'
import { PhotoFrame } from './photo-frame'

export function Hero({ schools, countries }: { schools: number; countries: number }) {
  return (
    <section className="sur-creme relative overflow-hidden bg-creme text-encre">
      <div className="relative mx-auto grid max-w-[1280px] items-center gap-12 px-5 pb-16 pt-8 sm:px-8 lg:grid-cols-[5fr_7fr] lg:gap-16 lg:pb-24 lg:pt-14">
        <div>
          <h1 className="max-w-[16ch] text-[clamp(2.5rem,5.2vw,4.25rem)] font-bold leading-[1.02] tracking-[-0.012em] text-vert text-balance [font-stretch:90%]">
            Retrouvez les anciens de votre promo
          </h1>
          <p className="mt-6 max-w-[44ch] text-lg leading-relaxed text-olive text-pretty">
            AET Connect réunit les Anciens Enfants de Troupe
            {schools > 0 ? ` des ${schools} écoles militaires préparatoires` : ' des écoles militaires préparatoires'}
            {countries > 1 ? ` de ${countries} pays` : ''}. Un réseau fermé, où l&apos;on entre par sa promo, sur
            l&apos;invitation d&apos;un ancien.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
            <a
              href="#rejoindre"
              className="group inline-flex min-h-12 items-center gap-2.5 rounded-full bg-vert px-6 text-base font-semibold text-or transition-colors duration-200 hover:bg-vert-carte"
            >
              Rejoindre ma promo
              <ArrowRight className="size-[18px] transition-transform duration-200 ease-out group-hover:translate-x-1" aria-hidden="true" />
            </a>
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center text-base font-semibold text-vert underline decoration-or decoration-2 underline-offset-[6px] hover:decoration-vert"
            >
              J&apos;ai déjà un compte
            </Link>
          </div>
        </div>

        {/* Mosaïque : un grand portrait à gauche, trois cadres empilés à droite */}
        <div className="relative grid h-[420px] grid-cols-[0.9fr_1fr] gap-3 sm:h-[540px] sm:gap-4 lg:h-[600px]">
          <div className="mosaique-cadre pt-10 sm:pt-16" style={{ ['--i' as string]: 0 }}>
            <PhotoFrame photo={PHOTOS.medailles} priority position="15% 18%" sizes="(min-width: 1024px) 320px, 45vw" className="size-full rounded-3xl" />
          </div>
          <div className="grid grid-rows-[1.15fr_0.9fr_1fr] gap-3 sm:gap-4">
            <div className="mosaique-cadre" style={{ ['--i' as string]: 1 }}>
              <PhotoFrame photo={PHOTOS.gardeHonneur} priority position="80% 35%" sizes="(min-width: 1024px) 360px, 50vw" className="size-full rounded-3xl rounded-tl-[72px]" />
            </div>
            <div className="mosaique-cadre" style={{ ['--i' as string]: 2 }}>
              <PhotoFrame photo={PHOTOS.officier} position="30% 30%" sizes="(min-width: 1024px) 360px, 50vw" className="size-full rounded-3xl" />
            </div>
            <div className="mosaique-cadre" style={{ ['--i' as string]: 3 }}>
              <PhotoFrame photo={PHOTOS.portage} position="60% 40%" sizes="(min-width: 1024px) 360px, 50vw" className="size-full rounded-3xl rounded-br-[72px]" />
            </div>
          </div>
          {/* Repère or, à la place des étincelles de la planche */}
          <Glyph name="losange" className="absolute -left-3 top-2 size-7 text-or sm:-left-6" />
        </div>
      </div>
    </section>
  )
}
