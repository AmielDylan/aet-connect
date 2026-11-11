'use client'

import { useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { realSchools, type LandingSchool } from '@/lib/landing'
import { Soleil } from './soleil'
import { Drapeau } from './drapeau'

// Le bandeau des écoles : chaque sigle et sa ville, séparés par un petit soleil.
// La liste est doublée pour boucler sans couture ; la copie est cachée aux lecteurs d'écran.
// Le défilement se met en pause au survol et par le bouton (WCAG 2.2.2).
export function SchoolsBand({ schools }: { schools: LandingSchool[] }) {
  const [paused, setPaused] = useState(false)
  const list = realSchools(schools)
  if (list.length === 0) return null

  const row = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {list.map((s) => (
        <li key={s.id} className="flex items-center">
          <span className="flex items-center gap-2.5 whitespace-nowrap px-10 text-xl font-semibold tracking-[-0.01em] text-creme font-titre sm:text-2xl">
            {s.acronym} <span className="font-normal text-brume">{s.city}</span>
            <Drapeau pays={s.country} className="h-[0.7em] w-auto ring-1 ring-creme/25" />
          </span>
          <Soleil className="size-6" petales="fill-creme/70" coeur="fill-terre" />
        </li>
      ))}
    </ul>
  )

  return (
    <section aria-label="Les écoles du réseau" className="sur-vert relative overflow-hidden bg-vert py-5">
      <div className="defile-ecoles flex w-max" style={paused ? { animationPlayState: 'paused' } : undefined}>
        {row(false)}
        {row(true)}
      </div>
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-label={paused ? 'Reprendre le défilement des écoles' : 'Mettre en pause le défilement des écoles'}
        className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-vert-nuit text-creme ring-2 ring-vert transition-colors hover:bg-vert-carte motion-reduce:hidden"
      >
        {paused ? <Play className="size-4" aria-hidden="true" /> : <Pause className="size-4" aria-hidden="true" />}
      </button>
    </section>
  )
}
