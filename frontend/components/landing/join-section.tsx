'use client'

import { useState } from 'react'
import { ArrowRight, Loader2 } from 'lucide-react'
import { useJoinPromo } from '@/hooks/use-join-promo'
import { realSchools, type LandingSchool } from '@/lib/landing'
import { BogolanPanel } from './bogolan'

const field =
  'min-h-12 w-full rounded-xl border-2 border-trait bg-white px-4 text-base text-encre transition-colors duration-200 hover:border-olive focus-visible:border-vert'

export function JoinSection({ schools }: { schools: LandingSchool[] }) {
  const [schoolId, setSchoolId] = useState('')
  const [entryYear, setEntryYear] = useState('')
  const { join, error, isPending } = useJoinPromo(schools)
  const list = realSchools(schools)

  return (
    <section id="rejoindre" aria-labelledby="rejoindre-titre" className="sur-creme scroll-mt-6 bg-creme px-5 py-20 text-encre sm:px-8 lg:py-28">
      <div className="mx-auto grid max-w-[1280px] items-center gap-10 lg:grid-cols-[5fr_7fr] lg:gap-16">
        <div>
          <h2 id="rejoindre-titre" className="max-w-[16ch] text-[clamp(2rem,3.8vw,3.25rem)] font-bold leading-[1.05] tracking-[-0.012em] text-vert text-balance [font-stretch:90%]">
            Rejoindre ma promo
          </h2>
          <p className="mt-5 max-w-[40ch] text-lg leading-relaxed text-olive text-pretty">
            Indiquez votre école et votre année d’entrée. Nous vérifions si votre promo a déjà des membres et vous
            orientons vers la bonne démarche.
          </p>
        </div>

        {/* Le formulaire, posé sur l'étoffe */}
        <div className="relative overflow-hidden rounded-3xl rounded-tl-[72px] bg-vert p-4 sm:p-10">
          <BogolanPanel className="absolute inset-0 text-creme/45" />
          <form
            className="relative grid gap-5 rounded-2xl bg-creme p-6 sm:max-w-[28rem] sm:p-8"
            onSubmit={(e) => {
              e.preventDefault()
              join(schoolId, entryYear)
            }}
          >
            <div className="grid gap-2">
              <label htmlFor="ecole" className="text-sm font-semibold text-vert">
                Votre école
              </label>
              <select
                id="ecole"
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value)}
                className={`${field} appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2214%22 height=%228%22><path d=%22M1 1l6 6 6-6%22 fill=%22none%22 stroke=%22%231D3B2A%22 stroke-width=%222%22/></svg>')] bg-[length:14px_8px] bg-[position:right_16px_center] bg-no-repeat pr-11`}
              >
                <option value="">Choisir une école</option>
                {list.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.acronym} · {s.city} ({s.country})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="annee" className="text-sm font-semibold text-vert">
                Année d’entrée
              </label>
              <input
                id="annee"
                inputMode="numeric"
                autoComplete="off"
                maxLength={4}
                placeholder="par exemple 2005"
                value={entryYear}
                onChange={(e) => setEntryYear(e.target.value.replace(/\D/g, ''))}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? 'rejoindre-erreur' : undefined}
                className={`${field} tabular-nums placeholder:text-olive`}
              />
            </div>
            {error && (
              <p id="rejoindre-erreur" role="alert" className="text-sm font-semibold text-alerte">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={isPending}
              className="group mt-1 inline-flex min-h-12 items-center justify-center gap-2.5 justify-self-start rounded-full bg-vert px-7 text-base font-semibold text-or transition-colors duration-200 hover:bg-vert-carte disabled:opacity-70"
            >
              {isPending ? 'Vérification…' : 'Trouver ma promo'}
              {isPending ? (
                <Loader2 className="size-[18px] animate-spin" aria-hidden="true" />
              ) : (
                <ArrowRight className="size-[18px] transition-transform duration-200 ease-out group-hover:translate-x-1" aria-hidden="true" />
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
