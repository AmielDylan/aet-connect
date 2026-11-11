import Link from 'next/link'
import { PHOTOS, type Photo } from '@/lib/landing'
import { Soleil } from './soleil'

export function SiteFooter() {
  return (
    <footer className="sur-vert trame trame-sur-vert bg-vert-nuit text-creme">
      <div className="mx-auto max-w-[1280px] px-5 pb-8 pt-16 sm:px-8 sm:pt-20">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <p className="flex items-center gap-3 text-base text-brume">
            <Soleil className="size-8" petales="fill-creme" coeur="fill-terre" />
            Annuaire panafricain des Anciens Enfants de Troupe
          </p>
          <nav aria-label="Pied de page" className="flex flex-wrap gap-x-6 text-sm">
            <a href="#rejoindre" className="inline-flex min-h-11 items-center text-creme decoration-or decoration-2 underline-offset-[6px] transition-colors duration-200 hover:text-or hover:underline focus-visible:text-or">
              Rejoindre ma promo
            </a>
            <Link href="/register/with-code" className="inline-flex min-h-11 items-center text-creme decoration-or decoration-2 underline-offset-[6px] transition-colors duration-200 hover:text-or hover:underline focus-visible:text-or">
              Entrer mon code
            </Link>
            <Link href="/login" className="inline-flex min-h-11 items-center text-creme decoration-or decoration-2 underline-offset-[6px] transition-colors duration-200 hover:text-or hover:underline focus-visible:text-or">
              Se connecter
            </Link>
          </nav>
        </div>

        {/* Le nom, en très grand : la signature de la page */}
        <p
          aria-hidden="true"
          className="mt-14 whitespace-nowrap font-titre text-[clamp(1.75rem,11.2vw,9.7rem)] font-bold leading-[0.95] tracking-[-0.04em] sm:mt-20"
        >
          AET <span className="text-or">Connect</span>
        </p>

        {/* Crédits : photos d'illustration sous licence libre, jamais des membres */}
        <details className="mt-10 text-sm text-brume">
          <summary className="inline-flex min-h-11 cursor-pointer items-center font-semibold text-creme">
            Crédits photographiques
          </summary>
          <p className="mt-3 max-w-[70ch]">
            Photographies d’illustration de soldats et d’officiers des pays des écoles, via Wikimedia Commons, et images
            générées pour AET Connect. Les personnes représentées ne sont pas des membres d’AET Connect.
          </p>
          {/* Chaque lien seul sur sa ligne : reconnaissable sans soulignement au repos */}
          <ul className="mt-4 grid gap-3">
            {(Object.values(PHOTOS) as Photo[]).map((p) => (
              <li key={p.src} className="grid">
                {p.page ? (
                  <a href={p.page} className="justify-self-start text-creme decoration-or underline-offset-4 transition-colors duration-200 hover:text-or hover:underline focus-visible:text-or" rel="noopener noreferrer" target="_blank">
                    {p.alt}
                  </a>
                ) : (
                  <span className="text-creme">{p.alt}</span>
                )}
                <span>
                  {p.by} · {p.licence}
                  {'note' in p && p.note ? ` · ${p.note}` : ''}
                </span>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </footer>
  )
}
