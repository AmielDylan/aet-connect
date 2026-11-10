import Link from 'next/link'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'

// Les trois façons d'entrer : la ligne se divise en trois branches, une par parcours réel.
const BRANCHES = [
  {
    when: 'Un ancien vous a envoyé un code',
    action: 'Entrez votre code',
    detail: "Le code vous rattache à la promo de l'ancien qui vous l'a donné.",
    href: '/register/with-code',
  },
  {
    when: 'Votre promo est déjà sur la ligne',
    action: 'Demandez un code',
    detail: "Votre demande part vers l'ambassadeur de votre promo, ou vers l'un de ses membres.",
    href: '/register/request-code',
  },
  {
    when: 'Vous êtes le premier de votre promo',
    action: "Demandez l'accès",
    detail: "Un administrateur vérifie votre demande et vous transmet votre code d'invitation.",
    href: '/register/request-access',
  },
]

export function WaysIn() {
  return (
    <section className="bg-outremer-nuit px-5 py-20 text-craie sm:px-8 sm:py-28" aria-labelledby="entrer">
      <div className="mx-auto max-w-[1440px]">
        <h2 id="entrer" className="max-w-[16ch] font-display text-[clamp(2.25rem,4.5vw,4rem)] font-extrabold uppercase leading-[0.9] text-balance">
          Trois façons de monter sur la ligne
        </h2>
        <p className="mt-4 max-w-[52ch] font-label text-lg text-brume text-pretty">
          Personne n&apos;entre seul : chaque membre a été invité par un ancien de sa promo, ou accueilli par un
          administrateur quand sa promo n&apos;avait encore personne.
        </p>

        {/* Embranchement : un tronc safran qui se divise en trois, chaque terminus est un parcours */}
        <div className="relative mt-14">
          <svg viewBox="0 0 1200 90" className="hidden h-[90px] w-full md:block" aria-hidden="true" preserveAspectRatio="none">
            <path
              d="M600 0 L600 30 M600 30 L200 30 L200 90 M600 30 L600 90 M600 30 L1000 30 L1000 90"
              fill="none"
              stroke="var(--aet-safran)"
              strokeWidth={10}
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <ol className="grid gap-10 md:grid-cols-3 md:gap-8">
            {BRANCHES.map((branch) => (
              <li
                key={branch.href}
                // Sur mobile, une seule ligne descend de station en station (segment vers la suivante, sauf la dernière)
                className="relative grid content-start justify-items-start gap-2 pl-12 before:absolute before:-bottom-10 before:left-[11px] before:top-4 before:w-2.5 before:bg-safran before:content-[''] last:before:hidden md:justify-items-center md:pl-0 md:text-center md:before:hidden"
              >
                <span aria-hidden="true" className="absolute left-0 top-1.5 size-8 rounded-full border-[6px] border-safran bg-craie md:static md:mb-2" />
                <Link
                  href={branch.href}
                  className="group inline-flex min-h-11 items-center gap-2 font-display text-3xl font-extrabold uppercase leading-none tracking-[0.01em] text-craie hover:text-safran"
                >
                  {branch.action}
                  <ArrowRight className="size-6 transition-transform duration-200 ease-out group-hover:translate-x-1" aria-hidden="true" />
                </Link>
                <p className="max-w-[34ch] font-label text-base text-brume text-pretty">
                  <span className="font-semibold text-craie">{branch.when}.</span> {branch.detail}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

// La confidentialité : ce que le membre montre, ce qu'il cache. L'exemple est étiqueté comme tel.
const EXAMPLE = [
  { field: 'Promo', value: 'PMB · 2005', visible: true },
  { field: 'Ville', value: 'Cotonou, Bénin', visible: true },
  { field: 'Email', value: 'masqué', visible: false },
  { field: 'Téléphone', value: 'masqué', visible: false },
]

export function YourVisibility() {
  return (
    <section className="bg-craie px-5 py-20 text-outremer sm:px-8 sm:py-28" aria-labelledby="visibilite">
      <div className="mx-auto grid max-w-[1440px] items-center gap-12 md:grid-cols-[1.1fr_1fr]">
        <div>
          <h2 id="visibilite" className="max-w-[14ch] font-display text-[clamp(2.25rem,4.5vw,4rem)] font-extrabold uppercase leading-[0.9] text-balance">
            Vous choisissez ce que les autres voient
          </h2>
          <p className="mt-5 max-w-[50ch] font-label text-lg leading-relaxed text-pretty">
            L&apos;annuaire n&apos;est ouvert qu&apos;aux membres connectés. Votre email et votre téléphone
            restent cachés tant que vous ne décidez pas de les montrer, et vous pouvez vous retirer de
            l&apos;annuaire à tout moment.
          </p>
        </div>

        <figure className="border-4 border-outremer">
          <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 bg-outremer px-4 py-2 font-label text-sm font-semibold text-craie">
            <span>Exemple de fiche</span>
            <span className="text-brume">ce que voient les autres membres</span>
          </figcaption>
          <dl className="divide-y-2 divide-outremer/15">
            {EXAMPLE.map((row) => (
              <div key={row.field} className="flex items-center justify-between gap-4 px-4 py-3 font-label">
                <dt className="text-sm font-semibold">{row.field}</dt>
                <dd className={`flex items-center gap-2 text-base ${row.visible ? '' : 'text-outremer/75'}`}>
                  {row.visible ? (
                    <Eye className="size-4 text-savane" aria-hidden="true" />
                  ) : (
                    <EyeOff className="size-4" aria-hidden="true" />
                  )}
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

export function LandingFooter() {
  return (
    <footer className="bg-outremer px-5 py-12 text-craie sm:px-8">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-3xl font-extrabold uppercase leading-none">
            AET Connect
          </p>
          <p className="mt-2 font-label text-sm text-brume">Annuaire panafricain des Anciens Enfants de Troupe</p>
        </div>
        <nav aria-label="Pied de page" className="flex gap-6 font-label text-sm font-semibold">
          <Link href="/register" className="inline-flex min-h-11 items-center underline decoration-safran decoration-2 underline-offset-4 hover:text-safran">
            Rejoindre ma promo
          </Link>
          <Link href="/login" className="inline-flex min-h-11 items-center underline decoration-safran decoration-2 underline-offset-4 hover:text-safran">
            Se connecter
          </Link>
        </nav>
      </div>
    </footer>
  )
}
