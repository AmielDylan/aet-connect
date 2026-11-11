import { espritFonts } from '@/lib/fonts'

// L'inscription, dans le monde « Esprit de corps » (polices et surfaces de l'accueil)
export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${espritFonts} esprit font-texte`}>{children}</div>
}
