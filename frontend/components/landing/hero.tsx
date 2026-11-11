import { ArrowRight } from 'lucide-react'
import { PHOTOS } from '@/lib/landing'
import { PhotoFrame } from './photo-frame'

export function Hero() {
  return (
    <section className="sur-creme text-encre">
      <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-5 pb-16 pt-8 sm:px-8 lg:grid-cols-[5fr_7fr] lg:gap-16 lg:pb-24 lg:pt-14">
        <div>
          <h1 className="text-[clamp(2.1rem,4vw,3.4rem)] font-bold leading-[1.14] tracking-[-0.015em] text-vert text-balance font-titre">
            Enfants de Troupe, une seule famille
          </h1>
          <p className="mt-6 max-w-[44ch] text-lg leading-relaxed text-olive text-pretty">
            Cet annuaire numérique est une porte d’entrée à la communauté élargie que forment les Anciens Enfants de
            Troupe. Retrouvez-y vos collègues de promotion, sur invitation.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
            <a
              href="#rejoindre"
              className="group inline-flex min-h-12 items-center gap-2.5 rounded-full bg-vert px-6 text-base text-creme transition-colors duration-200 hover:bg-vert-carte"
            >
              Rejoindre ma promo
              <ArrowRight className="size-[18px] transition-transform duration-200 ease-out group-hover:translate-x-1" aria-hidden="true" />
            </a>
            <a
              href="#parcours"
              className="inline-flex min-h-11 items-center text-encre decoration-terre decoration-2 underline-offset-[6px] transition-colors duration-200 hover:text-terre hover:underline focus-visible:text-terre"
            >
              Comment rejoindre
            </a>
          </div>
        </div>

        {/* Mosaïque : un grand portrait à gauche, trois cadres empilés à droite */}
        <div className="grid h-[420px] grid-cols-[0.9fr_1fr] gap-3 sm:h-[540px] sm:gap-4 lg:h-[600px]">
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
        </div>
      </div>
    </section>
  )
}
