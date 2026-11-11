import { espritFonts } from '@/lib/fonts'
import { PiedEspace } from '@/components/espace/pied'

// Maquettes temporaires de l'espace membre : mêmes polices, même fond, même pied que l'espace réel
export const metadata = { robots: { index: false, follow: false } }

export default function MaquettesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{ ['--trame-opacite' as string]: 0.035 }}
      className={`${espritFonts} esprit trame trame-sur-creme flex min-h-svh flex-col bg-creme font-texte text-encre`}
    >
      <div className="flex-1">{children}</div>
      <PiedEspace />
    </div>
  )
}
