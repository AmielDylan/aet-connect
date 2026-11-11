'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { espritFonts } from '@/lib/fonts'
import { EnteteEspace } from './entete'
import { PiedEspace } from './pied'

// Le cadre de l'espace membre (tableau de bord, profils) : réservé aux membres connectés, en-tête comme l'accueil,
// contenu sur crème, pied vert
export function EspaceMembre({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
    }
  }, [isAuthenticated, isLoading, router])

  return (
    <div
      style={{ ['--trame-opacite' as string]: 0.035 }}
      className={`${espritFonts} esprit trame trame-sur-creme flex min-h-svh flex-col bg-creme font-texte text-encre`}
    >
      {isLoading || !isAuthenticated ? (
        <div className="grid flex-1 place-items-center" role="status">
          <p className="flex items-center gap-3 text-base text-olive">
            <Loader2 className="size-5 animate-spin text-vert" aria-hidden="true" />
            {isLoading ? 'Ouverture de votre espace…' : 'Redirection vers la connexion…'}
          </p>
        </div>
      ) : (
        <>
          <a
            href="#contenu"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-vert focus:px-4 focus:py-2 focus:text-creme"
          >
            Aller au contenu
          </a>
          <EnteteEspace />
          <main id="contenu" className="mx-auto w-full max-w-6xl flex-1 px-5 pb-20 pt-4 sm:px-8 sm:pt-8">
            {children}
          </main>
          <PiedEspace />
        </>
      )}
    </div>
  )
}
