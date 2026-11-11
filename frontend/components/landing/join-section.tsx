'use client'

import { useState } from 'react'
import { ArrowRight, ChevronDown, Loader2 } from 'lucide-react'
import { useJoinPromo } from '@/hooks/use-join-promo'
import { realSchools, type LandingSchool } from '@/lib/landing'

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
          <h2 id="rejoindre-titre" className="max-w-[16ch] text-[clamp(1.75rem,3.1vw,2.6rem)] font-bold leading-[1.1] tracking-[-0.025em] text-vert text-balance font-titre">
            Rejoindre ma promo
          </h2>
          <p className="mt-5 max-w-[40ch] text-lg leading-relaxed text-olive text-pretty">
            Avec votre école et votre année d’entrée, nous regardons si des collègues de votre promo sont déjà
            inscrits, et nous vous indiquons la marche à suivre.
          </p>
        </div>

        {/* Le formulaire, posé sur l'étoffe */}
        <div className="sur-vert trame trame-etoffe overflow-hidden rounded-3xl rounded-tl-[72px] bg-vert p-4 sm:p-10">
          <form
            className="sur-creme relative grid gap-5 rounded-2xl rounded-tl-[56px] bg-creme p-6 pt-8 sm:max-w-[28rem] sm:rounded-tl-[48px] sm:p-8 sm:pt-10"
            onSubmit={(e) => {
              e.preventDefault()
              join(schoolId, entryYear)
            }}
          >
            <div className="grid gap-2">
              <label htmlFor="ecole" className="text-sm font-semibold text-vert">
                Votre école
              </label>
              {/* La flèche signale la liste déroulante (le select natif perd la sienne avec appearance-none) */}
              <div className="relative">
                <select
                  id="ecole"
                  value={schoolId}
                  onChange={(e) => setSchoolId(e.target.value)}
                  className={`${field} cursor-pointer appearance-none pr-12`}
                >
                  <option value="">Choisir une école</option>
                  {list.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.acronym} · {s.city} ({s.country})
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-vert" aria-hidden="true" />
              </div>
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
              className="group mt-1 inline-flex min-h-12 items-center justify-center gap-2.5 justify-self-start rounded-full bg-vert px-7 text-base font-semibold text-creme transition-colors duration-200 hover:bg-vert-carte disabled:opacity-70"
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
