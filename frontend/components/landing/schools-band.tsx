'use client'

import { useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { realSchools, type LandingSchool } from '@/lib/landing'
import { Glyph } from './bogolan'

const SEPARATORS = ['chevrons', 'losange', 'echelle', 'spirale'] as const

// Le bandeau des écoles : chaque sigle et sa ville, séparés par un motif or.
// La liste est doublée pour boucler sans couture ; la copie est cachée aux lecteurs d'écran.
// Le défilement se met en pause au survol et par le bouton (WCAG 2.2.2).
export function SchoolsBand({ schools }: { schools: LandingSchool[] }) {
  const [paused, setPaused] = useState(false)
  const list = realSchools(schools)
  if (list.length === 0) return null

  const row = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {list.map((s, i) => (
        <li key={s.id} className="flex items-center">
          <span className="whitespace-nowrap px-6 text-xl font-semibold tracking-[-0.01em] text-creme [font-stretch:90%] sm:text-2xl">
            {s.acronym} <span className="font-normal text-brume">{s.city}</span>
          </span>
          <Glyph name={SEPARATORS[i % SEPARATORS.length]} className="size-6 text-or" />
        </li>
      ))}
    </ul>
  )

  return (
    <section aria-label="Les écoles du réseau" className="relative overflow-hidden bg-vert py-5">
      <div className="defile-ecoles flex w-max" style={paused ? { animationPlayState: 'paused' } : undefined}>
        {row(false)}
        {row(true)}
      </div>
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-label={paused ? 'Reprendre le défilement des écoles' : 'Mettre en pause le défilement des écoles'}
        className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-vert-nuit text-or ring-2 ring-vert transition-colors hover:bg-vert-carte motion-reduce:hidden"
      >
        {paused ? <Play className="size-4" aria-hidden="true" /> : <Pause className="size-4" aria-hidden="true" />}
      </button>
    </section>
  )
}
