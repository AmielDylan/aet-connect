import type { Metadata } from 'next'
import { Big_Shoulders, Atkinson_Hyperlegible_Next } from 'next/font/google'
import { AetLineHero, type LandingSchool } from '@/components/landing/aet-line-hero'
import { WaysIn, YourVisibility, LandingFooter } from '@/components/landing/landing-sections'

// Polices du monde « la ligne AET », téléchargées au build et servies par le site
const display = Big_Shoulders({ subsets: ['latin'], weight: ['800'], variable: '--font-big-shoulders', display: 'swap' })
const label = Atkinson_Hyperlegible_Next({ subsets: ['latin'], variable: '--font-atkinson', display: 'swap' })

export const metadata: Metadata = {
  title: 'AET Connect · Annuaire panafricain des Anciens Enfants de Troupe',
  description:
    'Retrouvez votre promo et les anciens de toutes les écoles militaires préparatoires. Un réseau fermé, où l’on entre sur l’invitation d’un ancien.',
}

// Les écoles et leur nombre réel d'anciens, rafraîchis toutes les 5 minutes
export const revalidate = 300

async function loadSchools(): Promise<LandingSchool[]> {
  const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  try {
    const res = await fetch(`${api}/api/schools`, { next: { revalidate } })
    if (!res.ok) return []
    const body = (await res.json()) as { schools?: LandingSchool[] }
    return body.schools ?? []
  } catch {
    // API injoignable (build sans backend…) : la page s'affiche sans les chiffres, et se rafraîchit ensuite
    return []
  }
}

export default async function HomePage() {
  const schools = await loadSchools()

  return (
    <main className={`${display.variable} ${label.variable} ligne-aet font-label`}>
      <AetLineHero schools={schools} />
      <WaysIn />
      <YourVisibility />
      <LandingFooter />
    </main>
  )
}
