'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useJoinPromo } from '@/hooks/use-join-promo'
import { LINE_LENGTH, VIEWBOX, lengthUntil, linePath, placeSchools } from '@/lib/aet-line'
import { SchoolMotif } from './school-motif'

export type LandingSchool = {
  id: string
  name_fr: string
  acronym?: string | null
  city: string
  country: string
  established_year: number | null
  total_members: number
}

const anciens = (n: number) => (n === 0 ? 'aucun ancien encore' : n === 1 ? '1 ancien' : `${n} anciens`)

export function AetLineHero({ schools }: { schools: LandingSchool[] }) {
  const { placed, others } = useMemo(() => placeSchools(schools), [schools])
  const countries = useMemo(() => new Set(schools.map((s) => s.country)).size, [schools])
  const [selectedId, setSelectedId] = useState('')
  const [hoveredId, setHoveredId] = useState('')
  const [entryYear, setEntryYear] = useState('')
  const { join, error, isPending } = useJoinPromo(schools)
  const { isAuthenticated } = useAuth()

  const focusId = hoveredId || selectedId
  const focused = placed.find((p) => p.school.id === focusId)
  const reach = focused ? lengthUntil(focused.station.x, focused.station.y) : 0

  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-outremer text-craie">
      {/* Cartouche du plan */}
      <header className="relative z-20 mx-auto flex max-w-[1440px] items-center justify-between px-5 pt-5 sm:px-8 sm:pt-7">
        <Link href="/" className="font-display text-2xl font-extrabold uppercase leading-none tracking-[0.02em]">
          AET Connect
        </Link>
        <Link
          href={isAuthenticated ? '/dashboard' : '/login'}
          className="inline-flex min-h-11 items-center border-2 border-craie px-4 font-label text-sm font-semibold transition-colors hover:bg-craie hover:text-outremer"
        >
          {isAuthenticated ? 'Mon espace' : 'Se connecter'}
        </Link>
      </header>

      <div className="relative z-10 mx-auto grid max-w-[1440px] gap-10 px-5 pb-12 pt-8 sm:px-8 lg:grid-cols-[minmax(320px,400px)_1fr] lg:gap-6 lg:pt-6">
        {/* Légende du plan : l'offre et l'action */}
        <div className="flex flex-col justify-center lg:min-h-[calc(100svh-120px)]">
          <h1 className="font-display text-[clamp(3rem,7vw,5.75rem)] font-extrabold uppercase leading-[0.88] tracking-[-0.01em] text-balance">
            {schools.length > 0 ? `${schools.length} écoles, une seule ligne` : 'Toutes les écoles, une seule ligne'}
          </h1>
          <p className="mt-5 max-w-[34ch] font-label text-lg leading-snug text-brume text-pretty">
            AET Connect réunit les Anciens Enfants de Troupe{countries > 1 ? ` de ${countries} pays` : ''}. On y
            entre par sa promo, sur l&apos;invitation d&apos;un ancien. Retrouvez la vôtre.
          </p>

          <form
            className="mt-8 grid gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              join(selectedId, entryYear)
            }}
          >
            <div className="grid gap-1.5">
              <label htmlFor="ecole" className="font-label text-sm font-semibold">
                Votre école <span className="font-normal text-brume">(ou touchez sa station)</span>
              </label>
              <select
                id="ecole"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="min-h-12 w-full appearance-none border-2 border-craie bg-outremer-nuit bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2214%22 height=%228%22><path d=%22M1 1l6 6 6-6%22 fill=%22none%22 stroke=%22%23F2A900%22 stroke-width=%222%22/></svg>')] bg-[length:14px_8px] bg-[position:right_14px_center] bg-no-repeat px-3 pr-10 font-label text-base text-craie"
              >
                <option value="">Choisir une école</option>
                {[...placed.map((p) => p.school), ...others].map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name_fr} ({s.city})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="annee" className="font-label text-sm font-semibold">
                Année d&apos;entrée
              </label>
              <input
                id="annee"
                inputMode="numeric"
                autoComplete="off"
                maxLength={4}
                placeholder="par exemple 2005"
                value={entryYear}
                onChange={(e) => setEntryYear(e.target.value.replace(/\D/g, ''))}
                aria-describedby={error ? 'rejoindre-erreur' : undefined}
                className="min-h-12 w-full border-2 border-craie bg-outremer-nuit px-3 font-label text-base tabular-nums text-craie placeholder:text-brume"
              />
            </div>
            {error && (
              <p id="rejoindre-erreur" role="alert" className="font-label text-sm font-semibold text-safran">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={isPending}
              className="group inline-flex min-h-13 items-center justify-between gap-3 bg-corail px-5 font-label text-lg font-bold text-encre transition-[transform,background-color] duration-200 ease-out hover:bg-[color-mix(in_oklab,var(--aet-corail),white_12%)] active:translate-y-px disabled:opacity-70"
            >
              Rejoindre ma promo
              {isPending ? (
                <Loader2 className="size-5 animate-spin" aria-hidden="true" />
              ) : (
                <ArrowRight className="size-5 transition-transform duration-200 ease-out group-hover:translate-x-1" aria-hidden="true" />
              )}
            </button>
          </form>

          <p className="mt-5 font-label text-sm text-brume">
            Un ancien vous a envoyé un code ?{' '}
            <Link href="/register/with-code" className="font-semibold text-craie underline decoration-safran decoration-2 underline-offset-4 hover:text-safran">
              Entrez-le directement
            </Link>
          </p>
        </div>

        {/* Le plan : bureau et tablette */}
        <div className="relative hidden md:block" onMouseLeave={() => setHoveredId('')}>
          <div className="relative mx-auto w-full max-w-[980px]" style={{ aspectRatio: `${VIEWBOX.width} / ${VIEWBOX.height}` }}>
            <svg viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`} className="pointer-events-none absolute inset-0 z-0 size-full" aria-hidden="true">
              <path d={linePath} className="ligne-aet-trace" fill="none" stroke="var(--aet-safran)" strokeWidth={10} strokeLinejoin="round" strokeLinecap="round" style={{ ['--len' as string]: LINE_LENGTH }} />
              {focused && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="var(--aet-craie)"
                  strokeWidth={4}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeDasharray={`${reach} ${LINE_LENGTH}`}
                  className="transition-[stroke-dasharray] duration-500 ease-out"
                />
              )}
            </svg>

            {placed.map(({ station, school }, i) => {
              const isFocus = school.id === focusId
              const isSelected = school.id === selectedId
              // La station est un point sans taille : l'étiquette se place à distance fixe du disque (rayon 28 px + marge)
              const side =
                station.label === 'left' ? 'right-10 top-0 -translate-y-1/2 items-end text-right'
                : station.label === 'right' ? 'left-10 top-0 -translate-y-1/2'
                : station.label === 'above' ? 'bottom-10 left-0 -translate-x-1/2 items-center text-center'
                : 'top-10 left-0 -translate-x-1/2 items-center text-center'
              return (
                <div
                  key={school.id}
                  className="ligne-aet-station absolute z-10 size-0"
                  style={{ left: `${(station.x / VIEWBOX.width) * 100}%`, top: `${(station.y / VIEWBOX.height) * 100}%`, ['--i' as string]: i }}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedId(isSelected ? '' : school.id)}
                    onMouseEnter={() => setHoveredId(school.id)}
                    onFocus={() => setHoveredId(school.id)}
                    onBlur={() => setHoveredId('')}
                    aria-pressed={isSelected}
                    aria-label={`${school.name_fr}, ${school.city}, ${school.country} : ${anciens(school.total_members)}`}
                    className={`absolute left-0 top-0 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 border-outremer transition-[background-color,color,scale] duration-200 ease-out ${isSelected || isFocus ? 'scale-110 bg-safran text-encre' : 'bg-craie text-outremer'}`}
                  >
                    <SchoolMotif index={i} size={40} />
                  </button>
                  <div className={`pointer-events-none absolute flex flex-col whitespace-nowrap ${side}`}>
                    <span className="font-display text-xl font-extrabold uppercase leading-none tracking-[0.03em]">
                      {school.acronym ?? school.city}
                    </span>
                    <span className="font-label text-xs font-semibold text-brume">
                      {school.city}, {school.country}
                    </span>
                    {isFocus && (
                      <span className="mt-1 bg-outremer-nuit px-2 py-1 font-label text-xs font-semibold text-craie">
                        Depuis {school.established_year ?? '?'} · <span className="text-safran">{anciens(school.total_members)}</span>
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Le plan sur mobile : la ligne en bande verticale */}
        <ol
          className="relative grid gap-1 before:absolute before:bottom-6 before:left-[27px] before:top-6 before:w-2.5 before:rounded-full before:bg-safran before:content-[''] md:hidden"
          aria-label="Les écoles de la ligne AET"
        >
          {[...placed.map((p) => p.school), ...others].map((school, i) => {
            const isSelected = school.id === selectedId
            return (
              <li key={school.id} className="relative">
                <button
                  type="button"
                  onClick={() => setSelectedId(isSelected ? '' : school.id)}
                  aria-pressed={isSelected}
                  className="flex min-h-16 w-full items-center gap-4 text-left"
                >
                  <span className={`relative grid size-14 shrink-0 place-items-center rounded-full border-4 border-outremer ${isSelected ? 'bg-safran text-encre' : 'bg-craie text-outremer'}`}>
                    <SchoolMotif index={i} size={40} />
                  </span>
                  <span className="grid">
                    <span className="font-display text-xl font-extrabold uppercase leading-none tracking-[0.03em]">
                      {school.acronym ?? school.city}
                    </span>
                    <span className="font-label text-sm text-brume">
                      {school.city}, {school.country} · {anciens(school.total_members)}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
