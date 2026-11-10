import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PHOTOS, type Photo } from '@/lib/landing'
import { BogolanBand } from './bogolan'
import { PhotoFrame } from './photo-frame'

type Way = { title: string; text: string; action: string; href: string; photo: Photo; position: string; featured?: boolean }

const WAYS: Way[] = [
  {
    title: 'Un ancien vous a envoyé un code',
    text: 'Le code vous rattache directement à la promo de l’ancien qui vous l’a donné.',
    action: 'Entrer mon code',
    href: '/register/with-code',
    photo: PHOTOS.ceremonie,
    position: '30% 50%',
  },
  {
    title: 'Votre promo a déjà des membres',
    text: 'Votre demande part vers l’ambassadeur de votre promo, ou vers l’un de ses membres.',
    action: 'Demander un code',
    href: '/register/request-code',
    photo: PHOTOS.ecusson,
    position: '50% 50%',
    featured: true,
  },
  {
    title: 'Vous êtes le premier de votre promo',
    text: 'Un administrateur vérifie votre demande, puis vous transmet votre code d’invitation.',
    action: 'Demander l’accès',
    href: '/register/request-access',
    photo: PHOTOS.defile,
    position: '62% 40%',
  },
]

export function WaysIn() {
  return (
    <section id="parcours" aria-labelledby="parcours-titre" className="scroll-mt-6 bg-vert text-creme">
      <BogolanBand className="text-or/80" />
      <div className="mx-auto max-w-[1280px] px-5 py-20 sm:px-8 lg:py-24">
        <h2 id="parcours-titre" className="max-w-[18ch] text-[clamp(2rem,3.8vw,3.25rem)] font-bold leading-[1.05] tracking-[-0.012em] text-balance [font-stretch:90%]">
          Trois façons de rejoindre votre promo
        </h2>

        <ul className="mt-12 grid gap-5 md:grid-cols-3">
          {WAYS.map((way) => (
            <li
              key={way.href}
              className={`flex gap-2 rounded-[28px] p-3 ${way.featured ? 'flex-col-reverse bg-or text-vert-nuit' : 'flex-col bg-vert-carte'}`}
            >
              <PhotoFrame photo={way.photo} position={way.position} sizes="(min-width: 768px) 400px, 92vw" className="aspect-[16/10] rounded-[20px]" />
              <div className="flex flex-1 flex-col px-3 pb-3 pt-4">
                <h3 className="text-xl font-bold leading-tight tracking-[-0.01em] [font-stretch:90%]">{way.title}</h3>
                <p className={`mt-2 flex-1 text-base leading-relaxed ${way.featured ? 'text-vert-nuit/85' : 'text-brume'}`}>{way.text}</p>
                <Link
                  href={way.href}
                  className={`group mt-5 inline-flex min-h-11 items-center gap-2 self-start font-semibold underline decoration-2 underline-offset-[6px] ${way.featured ? 'text-vert-nuit decoration-vert-nuit/40 hover:decoration-vert-nuit' : 'text-or decoration-or/40 hover:decoration-or'}`}
                >
                  {way.action}
                  <ArrowRight className="size-[18px] transition-transform duration-200 ease-out group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <BogolanBand className="text-or/80" />
    </section>
  )
}
