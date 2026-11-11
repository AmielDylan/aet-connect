import Link from 'next/link'
import { Soleil } from '@/components/landing/soleil'

// Mise en page des écrans d'accès (mot de passe oublié, nouveau mot de passe).

/** « L'étoffe » (choisie par le client) : une colonne centrée sur la trame, le soleil en emblème, le formulaire dans sa carte */
export function ShellEtoffe({ children }: { children: React.ReactNode }) {
  return (
    <div className="trame trame-sur-creme flex min-h-svh flex-col items-center bg-creme px-5 py-10 text-encre sm:py-14">
      <main className="flex w-full max-w-[28rem] flex-1 flex-col justify-center">
        <Link href="/" className="mx-auto mb-8 flex flex-col items-center gap-3 text-vert" aria-label="AET Connect, retour à l’accueil">
          <Soleil className="size-14" />
          <span className="font-titre text-xl font-semibold tracking-[-0.02em]">AET Connect</span>
        </Link>
        <div className="rounded-[28px] rounded-tl-[72px] bg-white p-6 pt-10 sm:p-9 sm:pt-12">{children}</div>
      </main>
      <p className="mt-10 font-titre text-sm font-semibold tracking-[-0.01em] text-olive">AET un jour, AET toujours</p>
    </div>
  )
}
