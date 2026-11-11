import { PHOTOS, type Photo } from '@/lib/landing'
import { PhotoFrame } from './photo-frame'
import { LienFleche } from './lien-fleche'

type Way = { title: string; text: string; action: string; href: string; photo: Photo; position: string; featured?: boolean; bulle?: boolean }

const WAYS: Way[] = [
  {
    title: 'Un collègue de promotion vous a envoyé un code',
    text: 'Il suffit de le saisir : il vous rattache directement à votre promotion.',
    action: 'Entrer mon code',
    href: '/register/with-code',
    photo: PHOTOS.parcoursCode,
    position: '50% 50%',
    bulle: true,
  },
  {
    title: 'Des collègues de votre promo sont déjà inscrits',
    text: 'Votre demande arrive à l’équipe AET Connect, qui vous transmet un code pour rejoindre votre promo.',
    action: 'Demander un code',
    href: '/register/request-code',
    photo: PHOTOS.parcoursAccueil,
    position: '50% 50%',
    featured: true,
  },
  {
    title: 'Personne de votre promo n’est encore inscrit',
    text: 'Vous ouvrez la voie pour votre promo : un administrateur étudie votre demande, puis vous envoie votre code d’invitation.',
    action: 'Demander l’accès',
    href: '/register/request-access',
    photo: PHOTOS.parcoursSalle,
    position: '50% 50%',
  },
]

export function WaysIn() {
  return (
    <section id="parcours" aria-labelledby="parcours-titre" className="sur-vert trame trame-sur-vert scroll-mt-6 bg-vert text-creme">
      <div className="mx-auto max-w-[1280px] px-5 py-20 sm:px-8 lg:py-24">
        <h2 id="parcours-titre" className="max-w-[18ch] text-[clamp(1.75rem,3.1vw,2.6rem)] font-bold leading-[1.1] tracking-[-0.025em] text-balance font-titre">
          Trois façons de rejoindre votre promo
        </h2>

        <ul className="mt-12 grid gap-5 md:grid-cols-3">
          {WAYS.map((way) => (
            <li
              key={way.href}
              className={`flex flex-col gap-2 rounded-[28px] p-3 ${way.featured ? 'md:flex-col-reverse' : ''} sur-creme bg-creme text-encre`}
            >
              <PhotoFrame photo={way.photo} position={way.position} sizes="(min-width: 768px) 400px, 92vw" className="aspect-[16/10] rounded-[20px]">
                {/* Le code reçu, posé sur la bulle dessinée dans l'image (trop petite pour être lisible) */}
                {way.bulle && (
                  <span
                    aria-hidden="true"
                    className="absolute left-[60%] top-[39.5%] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-creme px-2 py-1.5 font-titre text-[9px] font-semibold tracking-[0.04em] text-vert shadow-md after:absolute after:left-[25%] after:top-full after:border-x-[4px] after:border-t-[5px] after:border-x-transparent after:border-t-creme sm:text-[10px]"
                  >
                    AET-7K2P-Q9XD
                  </span>
                )}
              </PhotoFrame>
              <div className="flex flex-1 flex-col px-3 pb-3 pt-4">
                <h3 className={`text-lg font-semibold leading-snug tracking-[-0.02em] font-titre text-vert`}>{way.title}</h3>
                <p className={`mt-2 flex-1 text-base leading-relaxed text-olive`}>{way.text}</p>
                <LienFleche href={way.href} className="mt-4 self-start">
                  {way.action}
                </LienFleche>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
