'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import Image from 'next/image'
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
// Il s'arrête au survol, au focus et dès qu'on choisit une photo (WCAG 2.2.2) ; immobile en mouvement réduit.
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
      className={`photo-cadre group relative overflow-hidden bg-sable ${className}`}
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

      {children}

      {/* Légende et repères, en bas à droite. La légende apparaît au survol sur ordinateur, reste visible sur mobile. */}
      <div className="absolute bottom-3 right-4 flex max-w-[calc(100%-11rem)] flex-col items-end gap-1.5 lg:max-w-[60%]">
        <p className="text-right text-xs leading-snug text-creme [text-shadow:0_0_2px_rgb(0_0_0/0.9),0_1px_8px_rgb(0_0_0/0.8)] transition-opacity duration-300 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100">
          {current.photo.caption}
        </p>
        {slides.length > 1 && (
          <div className="flex items-center">
            {slides.map((slide, i) => (
              <button
                key={slide.photo.src}
                type="button"
                onClick={() => {
                  setIndex(i)
                  setPaused(true) // choisir une photo arrête le défilement automatique (WCAG 2.2.2)
                }}
                aria-label={`Photo ${i + 1} sur ${slides.length}`}
                aria-current={i === index}
                className="grid size-6 place-items-center"
              >
                <span
                  className={`block h-1 rounded-full shadow-[0_0_6px_rgb(0_0_0/0.45)] transition-all duration-300 ${
                    i === index ? 'w-4 bg-creme' : 'w-1 bg-creme/55'
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
