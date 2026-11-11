import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { PHOTOS } from '@/lib/landing'
import { Brand } from '@/components/landing/site-header'
import { Soleil } from '@/components/landing/soleil'
import { LoginForm, NotYetMember } from '@/components/auth/login-form'
import { PhotoDiaporama } from '@/components/auth/photo-diaporama'

export const metadata: Metadata = {
  title: 'Se connecter · AET Connect',
  description: 'Connexion à l’annuaire des Anciens Enfants de Troupe.',
}

// Quatre scènes d'illustration (photos libres, jamais présentées comme des membres)
const SLIDES = [
  { photo: PHOTOS.officier, position: '28% 30%' },
  { photo: PHOTOS.ceremonie, position: '28% 50%' },
  { photo: PHOTOS.secours, position: '45% 40%' },
  { photo: PHOTOS.defile, position: '62% 40%' },
]

// La connexion, proposition A « Le portrait » : le formulaire d'abord (à droite sur ordinateur, en tête sur
// mobile), un diaporama encadré avec le cartouche « AET un jour, AET toujours ».
export default function LoginPage() {
  return (
    <div className="trame trame-sur-creme grid min-h-svh bg-creme text-encre lg:grid-cols-[1.05fr_1fr]">
      <main className="order-1 flex flex-col px-5 pb-10 pt-6 sm:px-10 lg:order-2 lg:justify-center lg:px-16 lg:py-12">
        <div className="mx-auto w-full max-w-[26rem]">
          <Link href="/" className="inline-flex text-vert">
            <Brand />
          </Link>
          <h1 className="mt-10 font-titre text-[clamp(1.75rem,3vw,2.4rem)] font-bold leading-[1.1] tracking-[-0.025em] text-vert text-balance">
            Bon retour parmi nous
          </h1>
          <p className="mt-3 text-lg leading-relaxed text-olive">Votre promo et tout l’annuaire vous attendent.</p>
          <div className="mt-8">
            <Suspense fallback={null}>
              <LoginForm />
            </Suspense>
          </div>
          <div className="mt-10">
            <NotYetMember />
          </div>
        </div>
      </main>

      <div className="order-2 p-3 sm:p-4 lg:order-1 lg:p-5">
        <PhotoDiaporama slides={SLIDES} className="h-72 rounded-3xl rounded-tr-[72px] sm:h-96 lg:h-full">
          <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-xl bg-creme px-2.5 py-2 lg:px-3 lg:py-2.5">
            <Soleil className="size-5 lg:size-6" />
            <p className="font-titre text-xs font-semibold leading-tight tracking-[-0.02em] text-vert max-[359px]:hidden lg:text-sm">
              AET un jour,
              <br />
              AET toujours
            </p>
          </div>
        </PhotoDiaporama>
      </div>
    </div>
  )
}
