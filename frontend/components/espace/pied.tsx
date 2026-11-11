import Link from 'next/link'
import { Soleil } from '@/components/landing/soleil'

// Le pied de page de l'espace membre : simple, dans la continuité de celui de l'accueil
const lien =
  'inline-flex min-h-11 items-center text-creme decoration-or decoration-2 underline-offset-[6px] transition-colors duration-200 hover:text-or hover:underline focus-visible:text-or'

export function PiedEspace() {
  return (
    <footer className="sur-vert bg-vert-nuit text-creme">
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-10 sm:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="flex items-center gap-3 text-base text-brume">
            <Soleil className="size-7" petales="fill-creme" coeur="fill-terre" />
            <span>
              <span className="font-titre text-creme">AET Connect</span> · AET un jour, AET toujours
            </span>
          </p>
          <nav aria-label="Pied de page" className="flex flex-wrap gap-x-6 text-sm">
            <Link href="/dashboard/directory" className={lien}>
              Annuaire
            </Link>
            <Link href="/dashboard/codes" className={lien}>
              Mes codes
            </Link>
            <Link href="/dashboard/profile" className={lien}>
              Mon profil
            </Link>
            <Link href="/" className={lien}>
              Le site AET Connect
            </Link>
          </nav>
        </div>
        <p className="text-sm text-brume">
          Photos d’illustration sous licence libre, via Wikimedia Commons. Les personnes représentées ne sont pas des membres d’AET Connect.
        </p>
      </div>
    </footer>
  )
}
