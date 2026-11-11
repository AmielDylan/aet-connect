'use client'

import { useState } from 'react'

// La photo d'un membre, ou ses initiales quand il n'en a pas mis (ou qu'elle ne se charge pas)
export function Portrait({
  prenom,
  nom,
  src,
  className = '',
}: {
  prenom: string
  nom: string
  src?: string | null
  className?: string
}) {
  const [enEchec, setEnEchec] = useState<string | null>(null)
  if (src && enEchec !== src) {
    // eslint-disable-next-line @next/next/no-img-element -- photos de profil hébergées par Supabase Storage
    return <img src={src} alt="" onError={() => setEnEchec(src)} className={`shrink-0 object-cover ${className}`} />
  }
  return (
    <span aria-hidden="true" className={`grid shrink-0 place-items-center font-titre font-semibold tracking-[-0.02em] ${className}`}>
      {prenom?.[0]}
      {nom?.[0]}
    </span>
  )
}

/** Codes utilisés sur le quota : une case par code */
export function Jauge({ used, limit }: { used: number; limit: number }) {
  return (
    <span className="flex gap-1.5" aria-hidden="true">
      {Array.from({ length: limit }, (_, i) => (
        <span key={i} className={`h-2 flex-1 rounded-full ${i < used ? 'bg-vert' : 'bg-sable'}`} />
      ))}
    </span>
  )
}

/** « il y a 3 jours », « il y a 2 semaines »… */
export function depuis(date: string) {
  const jours = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000))
  const rtf = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' })
  if (jours < 7) return rtf.format(-jours, 'day')
  if (jours < 30) return rtf.format(-Math.floor(jours / 7), 'week')
  if (jours < 365) return rtf.format(-Math.floor(jours / 30), 'month')
  return rtf.format(-Math.floor(jours / 365), 'year')
}
