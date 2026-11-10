import type { Metadata } from 'next'
import { Archivo } from 'next/font/google'
import { schoolFacts, type LandingSchool } from '@/lib/landing'
import { SiteHeader } from '@/components/landing/site-header'
import { Hero } from '@/components/landing/hero'
import { SchoolsBand } from '@/components/landing/schools-band'
import { NetworkSection } from '@/components/landing/network-section'
import { WaysIn } from '@/components/landing/ways-in'
import { JoinSection } from '@/components/landing/join-section'
import { VisibilitySection, SiteFooter } from '@/components/landing/visibility-and-footer'

// Archivo, avec son axe de largeur : titres semi-condensés, texte courant en largeur normale
const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-archivo-var', display: 'swap' })

export const metadata: Metadata = {
  title: 'AET Connect · Annuaire panafricain des Anciens Enfants de Troupe',
  description:
    'Retrouvez les anciens de votre promo et de toutes les écoles militaires préparatoires. Un réseau fermé, où l’on entre sur l’invitation d’un ancien.',
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
  const facts = schoolFacts(schools)

  return (
    <div className={`${archivo.variable} esprit bg-creme font-archivo`}>
      <SiteHeader />
      <main id="contenu">
        <Hero />
        <SchoolsBand schools={schools} />
        <NetworkSection facts={facts} />
        <WaysIn />
        <JoinSection schools={schools} />
        <VisibilitySection />
      </main>
      <SiteFooter />
    </div>
  )
}
