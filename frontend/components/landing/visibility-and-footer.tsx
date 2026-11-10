import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { PHOTOS } from '@/lib/landing'
import { BogolanBand, Glyph } from './bogolan'

// La confidentialité : ce que le membre montre, ce qu'il cache. L'exemple est étiqueté comme tel.
const EXAMPLE = [
  { field: 'Promo', value: 'PMB · 2005', visible: true },
  { field: 'Ville', value: 'Cotonou, Bénin', visible: true },
  { field: 'Email', value: 'masqué', visible: false },
  { field: 'Téléphone', value: 'masqué', visible: false },
]

export function VisibilitySection() {
  return (
    <section id="visibilite" aria-labelledby="visibilite-titre" className="sur-creme scroll-mt-6 bg-white px-5 py-20 text-encre sm:px-8 lg:py-28">
      <div className="mx-auto grid max-w-[1280px] items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div>
          <h2 id="visibilite-titre" className="max-w-[16ch] text-[clamp(2rem,3.8vw,3.25rem)] font-bold leading-[1.05] tracking-[-0.012em] text-vert text-balance [font-stretch:90%]">
            Vous choisissez ce que les autres voient
          </h2>
          <p className="mt-5 max-w-[50ch] text-lg leading-relaxed text-olive text-pretty">
            L&apos;annuaire n&apos;est ouvert qu&apos;aux membres connectés. Votre email et votre téléphone restent
            cachés tant que vous ne décidez pas de les montrer, et vous pouvez vous retirer de l&apos;annuaire à
            tout moment.
          </p>
        </div>

        <figure className="overflow-hidden rounded-3xl border-2 border-sable bg-white">
          <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 bg-vert px-5 py-3 text-sm font-semibold text-creme">
            <span>Exemple de fiche</span>
            <span className="font-normal text-brume">ce que voient les autres membres</span>
          </figcaption>
          <dl className="divide-y-2 divide-sable/70">
            {EXAMPLE.map((row) => (
              <div key={row.field} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <dt className="text-sm font-semibold text-vert">{row.field}</dt>
                <dd className={`flex items-center gap-2 text-base ${row.visible ? 'text-encre' : 'text-olive'}`}>
                  {row.visible ? <Eye className="size-4 text-vert" aria-hidden="true" /> : <EyeOff className="size-4" aria-hidden="true" />}
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </figure>
      </div>
    </section>
  )
}

export function SiteFooter() {
  return (
    <footer className="bg-vert-nuit text-creme">
      <BogolanBand className="text-or/60" />
      <div className="mx-auto max-w-[1280px] px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="flex items-center gap-2.5 text-2xl font-bold [font-stretch:90%]">
              <span className="grid size-9 place-items-center rounded-full bg-or text-vert-nuit">
                <Glyph name="chevrons" className="size-5" />
              </span>
              AET Connect
            </p>
            <p className="mt-2 text-sm text-brume">Annuaire panafricain des Anciens Enfants de Troupe</p>
          </div>
          <nav aria-label="Pied de page" className="flex flex-wrap gap-x-6 text-sm font-semibold">
            <a href="#rejoindre" className="inline-flex min-h-11 items-center underline decoration-or decoration-2 underline-offset-[6px] hover:text-or">
              Rejoindre ma promo
            </a>
            <Link href="/register/with-code" className="inline-flex min-h-11 items-center underline decoration-or decoration-2 underline-offset-[6px] hover:text-or">
              Entrer un code
            </Link>
            <Link href="/login" className="inline-flex min-h-11 items-center underline decoration-or decoration-2 underline-offset-[6px] hover:text-or">
              Se connecter
            </Link>
          </nav>
        </div>

        {/* Crédits : photos d'illustration sous licence libre, jamais des membres */}
        <details className="mt-10 border-t border-creme/15 pt-6 text-sm text-brume">
          <summary className="inline-flex min-h-11 cursor-pointer items-center font-semibold text-creme">
            Crédits photographiques
          </summary>
          <p className="mt-3 max-w-[70ch]">
            Photographies d&apos;illustration de soldats et d&apos;officiers des pays des écoles, via Wikimedia Commons.
            Les personnes représentées ne sont pas des membres d&apos;AET Connect.
          </p>
          <ul className="mt-3 grid gap-1.5">
            {Object.values(PHOTOS).map((p) => (
              <li key={p.src}>
                <a href={p.page} className="underline decoration-creme/30 underline-offset-4 hover:text-creme" rel="noopener noreferrer" target="_blank">
                  {p.alt}
                </a>{' '}
                · {p.by} ·{' '}
                <a href={p.licenceUrl} className="underline decoration-creme/30 underline-offset-4 hover:text-creme" rel="noopener noreferrer license" target="_blank">
                  {p.licence}
                </a>
                {'note' in p && p.note ? ` · ${p.note}` : ''}
              </li>
            ))}
          </ul>
        </details>
      </div>
    </footer>
  )
}
