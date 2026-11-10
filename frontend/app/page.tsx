import type { Metadata } from 'next'
import { Figtree, Unbounded } from 'next/font/google'
import { schoolFacts, type LandingSchool } from '@/lib/landing'
import { SiteHeader } from '@/components/landing/site-header'
import { Hero } from '@/components/landing/hero'
import { SchoolsBand } from '@/components/landing/schools-band'
import { NetworkSection } from '@/components/landing/network-section'
import { WaysIn } from '@/components/landing/ways-in'
import { JoinSection } from '@/components/landing/join-section'
import { SiteFooter } from '@/components/landing/site-footer'

// Titres : Unbounded, capitales larges et pleines (l'énergie des grands rassemblements) ;
// texte : Figtree, ronde et amicale, en écho aux formes d'Unbounded. Toutes deux auto-hébergées par next/font.
const titre = Unbounded({ subsets: ['latin'], variable: '--font-titre-var', display: 'swap' })
const texte = Figtree({ subsets: ['latin'], variable: '--font-texte-var', display: 'swap' })

export const metadata: Metadata = {
  title: 'AET Connect · Annuaire panafricain des Anciens Enfants de Troupe',
  description:
    'Retrouvez les anciens de votre promo et de toutes les écoles militaires préparatoires. Un réseau privé, que l’on rejoint sur l’invitation d’un ancien.',
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
    // La trame couvre la page ; les sections à fond plein la recouvrent : elle ne se voit que derrière la
    // navigation et le hero, sans rupture entre les deux.
    <div className={`${titre.variable} ${texte.variable} esprit trame trame-sur-creme bg-creme font-texte`}>
      <SiteHeader />
      <main id="contenu">
        <Hero />
        <SchoolsBand schools={schools} />
        <NetworkSection facts={facts} />
        <WaysIn />
        <JoinSection schools={schools} />
      </main>
      <SiteFooter />
    </div>
  )
}
