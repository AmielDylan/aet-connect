'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import Image from 'next/image'
import { Pause, Play } from 'lucide-react'
import type { Photo } from '@/lib/landing'

type Slide = { photo: Photo; position: string }

// La préférence « mouvement réduit », suivie comme une source externe (pas de setState dans un effet)
const REDUCED = '(prefers-reduced-motion: reduce)'
function subscribeReduced(onChange: () => void) {
  const media = window.matchMedia(REDUCED)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}
const usePrefersReducedMotion = () =>
  useSyncExternalStore(subscribeReduced, () => window.matchMedia(REDUCED).matches, () => false)

// Diaporama de photos d'illustration : fondu toutes les 6 s, légende courte et factuelle.
// Il s'arrête au survol, au focus et par le bouton pause (WCAG 2.2.2) ; immobile en mouvement réduit.
export function PhotoDiaporama({
  slides,
  className = '',
  children,
  interval = 6000,
}: {
  slides: Slide[]
  className?: string
  children?: React.ReactNode
  interval?: number
}) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [held, setHeld] = useState(false)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (paused || held || reduced || slides.length < 2) return
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % slides.length), interval)
    return () => window.clearTimeout(timer)
  }, [index, paused, held, reduced, slides.length, interval])

  const current = slides[index]

  return (
    <section
      aria-roledescription="diaporama"
      aria-label="Photos d’illustration"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
      className={`photo-cadre relative overflow-hidden bg-sable ${className}`}
    >
      {slides.map((slide, i) => (
        <div
          key={slide.photo.src}
          aria-hidden={i !== index}
          className={`absolute inset-0 transition-opacity duration-700 ease-out ${i === index ? 'opacity-100' : 'opacity-0'}`}
        >
          <Image
            src={slide.photo.src}
            alt={slide.photo.alt}
            fill
            priority={i === 0}
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="photo-nb object-cover"
            style={{ objectPosition: slide.position }}
          />
        </div>
      ))}

      {/* Légende, écrite en petit */}
      <p className="absolute left-3 top-3 max-w-[calc(100%-1.5rem)] rounded-full bg-creme/95 px-3 py-1.5 text-xs text-olive">
        {current.photo.caption}
      </p>

      {children}

      {/* Repères et pause */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 right-3 flex items-center gap-0.5 rounded-full bg-creme/95 p-1 sm:gap-1">
          {slides.map((slide, i) => (
            <button
              key={slide.photo.src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Photo ${i + 1} sur ${slides.length}`}
              aria-current={i === index}
              className="grid size-6 place-items-center rounded-full sm:size-8"
            >
              <span className={`block h-1.5 rounded-full transition-all duration-300 ${i === index ? 'w-4 bg-vert sm:w-5' : 'w-1.5 bg-trait'}`} />
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? 'Reprendre le diaporama' : 'Mettre le diaporama en pause'}
            className="grid size-6 place-items-center rounded-full text-vert transition-colors hover:bg-white motion-reduce:hidden sm:size-8"
          >
            {paused ? <Play className="size-3.5" aria-hidden="true" /> : <Pause className="size-3.5" aria-hidden="true" />}
          </button>
        </div>
      )}
    </section>
  )
}
